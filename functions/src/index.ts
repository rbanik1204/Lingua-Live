import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

initializeApp();

const JITSI_DOMAIN = defineSecret('JITSI_DOMAIN');
const JITSI_JWT_APP_ID = defineSecret('JITSI_JWT_APP_ID');
const JITSI_JWT_APP_SECRET = defineSecret('JITSI_JWT_APP_SECRET');
const JITSI_JWT_AUD = defineSecret('JITSI_JWT_AUD');

// Zoom Server-to-Server OAuth secrets.
const ZOOM_ACCOUNT_ID = defineSecret('ZOOM_ACCOUNT_ID');
const ZOOM_CLIENT_ID = defineSecret('ZOOM_CLIENT_ID');
const ZOOM_CLIENT_SECRET = defineSecret('ZOOM_CLIENT_SECRET');
// The Zoom user (email or userId) under which meetings will be created.
// For a single-teacher product, this can just be the instructor's Zoom email.
const ZOOM_HOST_USER_ID = defineSecret('ZOOM_HOST_USER_ID');

// Gemini API key - stored in environment variable for Spark plan compatibility
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

function assertRoomName(roomName: unknown): string {
  if (typeof roomName !== 'string') {
    throw new HttpsError('invalid-argument', 'roomName must be a string');
  }
  const trimmed = roomName.trim();
  if (!trimmed) {
    throw new HttpsError('invalid-argument', 'roomName is required');
  }
  if (trimmed.length > 200) {
    throw new HttpsError('invalid-argument', 'roomName is too long');
  }

  // Keep it strict and predictable for self-hosted Jitsi: letters, numbers, _ and -.
  // (If you later need / for multi-tenant, loosen this carefully.)
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    throw new HttpsError('invalid-argument', 'roomName contains invalid characters');
  }

  return trimmed;
}

async function getRole(uid: string): Promise<string | null> {
  const snap = await getFirestore().doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  const role = snap.get('role');
  return typeof role === 'string' ? role : null;
}

function assertCourseId(courseId: unknown): string {
  if (typeof courseId !== 'string') {
    throw new HttpsError('invalid-argument', 'courseId must be a string');
  }
  const trimmed = courseId.trim();
  if (!trimmed) {
    throw new HttpsError('invalid-argument', 'courseId is required');
  }
  if (trimmed.length > 200) {
    throw new HttpsError('invalid-argument', 'courseId is too long');
  }
  return trimmed;
}

async function getZoomAccessToken(): Promise<string> {
  const accountId = ZOOM_ACCOUNT_ID.value();
  const clientId = ZOOM_CLIENT_ID.value();
  const clientSecret = ZOOM_CLIENT_SECRET.value();

  if (!accountId || !clientId || !clientSecret) {
    throw new HttpsError('failed-precondition', 'Zoom API secrets are not configured');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new HttpsError('internal', `Zoom token request failed (${resp.status}): ${text || 'unknown error'}`);
  }

  const data = (await resp.json()) as { access_token?: unknown };
  const accessToken = typeof data.access_token === 'string' ? data.access_token : null;
  if (!accessToken) {
    throw new HttpsError('internal', 'Zoom token response missing access_token');
  }

  return accessToken;
}

async function createInstantZoomMeeting(input: { hostUserId: string; topic: string }): Promise<{ joinUrl: string; startUrl: string }>
{
  const token = await getZoomAccessToken();

  const resp = await fetch(`https://api.zoom.us/v2/users/${encodeURIComponent(input.hostUserId)}/meetings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: input.topic,
      type: 1, // instant meeting
      settings: {
        join_before_host: true,
        waiting_room: false,
        approval_type: 2, // no registration required
      },
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new HttpsError('internal', `Zoom meeting create failed (${resp.status}): ${text || 'unknown error'}`);
  }

  const data = (await resp.json()) as { join_url?: unknown; start_url?: unknown };
  const joinUrl = typeof data.join_url === 'string' ? data.join_url : null;
  const startUrl = typeof data.start_url === 'string' ? data.start_url : null;
  if (!joinUrl || !startUrl) {
    throw new HttpsError('internal', 'Zoom create meeting response missing join_url/start_url');
  }

  return { joinUrl, startUrl };
}

export const getJitsiJwt = onCall(
  {
    region: 'us-central1',
    secrets: [JITSI_DOMAIN, JITSI_JWT_APP_ID, JITSI_JWT_APP_SECRET, JITSI_JWT_AUD],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in required');
    }

    const uid = request.auth.uid;
    const roomName = assertRoomName((request.data as any)?.roomName);

    const role = await getRole(uid);
    if (role !== 'teacher' && role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only teachers can request a moderator token');
    }

    const domain = JITSI_DOMAIN.value();
    const appId = JITSI_JWT_APP_ID.value();
    const secret = JITSI_JWT_APP_SECRET.value();
    const aud = JITSI_JWT_AUD.value() || 'jitsi';

    if (!domain || !appId || !secret) {
      throw new HttpsError('failed-precondition', 'Jitsi JWT secrets are not configured');
    }

    const email = typeof request.auth.token.email === 'string' ? request.auth.token.email : undefined;
    const nameFromToken = typeof request.auth.token.name === 'string' ? request.auth.token.name : undefined;

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      aud,
      iss: appId,
      sub: domain,
      room: roomName,
      nbf: now - 10,
      exp: now + 2 * 60 * 60,
      context: {
        user: {
          id: uid,
          name: nameFromToken || email || 'Teacher',
          email,
          moderator: true,
        },
      },
    };

    const token = jwt.sign(payload, secret, { algorithm: 'HS256' });

    return {
      token,
      domain,
      room: roomName,
      expiresInSeconds: 2 * 60 * 60,
    };
  }
);

export const createZoomMeetingForCourse = onCall(
  {
    region: 'us-central1',
    secrets: [ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_HOST_USER_ID],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in required');
    }

    const uid = request.auth.uid;
    const role = await getRole(uid);
    if (role !== 'teacher' && role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only teachers can start Zoom meetings');
    }

    const courseId = assertCourseId((request.data as any)?.courseId);
    const db = getFirestore();

    const courseSnap = await db.doc(`courses/${courseId}`).get();
    if (!courseSnap.exists) {
      throw new HttpsError('not-found', 'Course not found');
    }

    const createdByUid = courseSnap.get('createdByUid');
    if (createdByUid !== uid) {
      throw new HttpsError('permission-denied', 'Only the course owner can start Zoom for this course');
    }

    const courseTitleRaw = courseSnap.get('title');
    const courseTitle = typeof courseTitleRaw === 'string' ? courseTitleRaw : courseId;

    const hostUserId = ZOOM_HOST_USER_ID.value();
    if (!hostUserId) {
      throw new HttpsError('failed-precondition', 'ZOOM_HOST_USER_ID is not configured');
    }

    const { joinUrl, startUrl } = await createInstantZoomMeeting({
      hostUserId,
      topic: `LinguaLive - ${courseTitle}`,
    });

    await db.doc(`courseMeetings/${courseId}`).set(
      {
        courseId,
        provider: 'zoom',
        joinUrl,
        status: 'active',
        createdByUid: uid,
        startedAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return { courseId, joinUrl, startUrl };
  }
);

/**
 * Gemini AI Language Learning Chatbot
 * Premium feature for students learning Bengali, Hindi, and English
 */
export const chatWithAI = onCall(
  { maxInstances: 10 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in required');
    }

    const { message, language, conversationHistory } = request.data as {
      message?: unknown;
      language?: unknown;
      conversationHistory?: unknown;
    };

    // Validate message
    if (typeof message !== 'string' || !message.trim()) {
      throw new HttpsError('invalid-argument', 'Message is required');
    }

    // Validate language
    const validLanguages = ['Bengali', 'Hindi', 'English'];
    if (typeof language !== 'string' || !validLanguages.includes(language)) {
      throw new HttpsError('invalid-argument', 'Valid language is required (Bengali, Hindi, or English)');
    }

    // Validate conversation history (optional)
    let history: Array<{ role: string; content: string }> = [];
    if (conversationHistory) {
      if (!Array.isArray(conversationHistory)) {
        throw new HttpsError('invalid-argument', 'conversationHistory must be an array');
      }
      history = conversationHistory as Array<{ role: string; content: string }>;
    }

    if (!GEMINI_API_KEY) {
      throw new HttpsError('failed-precondition', 'Gemini API key not configured');
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Build system prompt for language learning
      const systemPrompt = `You are a friendly and patient language learning assistant helping students learn ${language}. 

Your role:
- Help students practice ${language} conversation
- Explain grammar concepts clearly
- Provide vocabulary help with examples
- Correct mistakes gently and explain why
- Share cultural insights about ${language === 'Bengali' ? 'Bengal/Bangladesh' : language === 'Hindi' ? 'India' : 'English-speaking countries'}
- Encourage students and celebrate their progress
- Provide romanization when helpful for ${language === 'Bengali' ? 'Bengali' : language === 'Hindi' ? 'Hindi' : 'English'} words

Keep responses:
- Encouraging and supportive
- Clear and concise (2-4 sentences usually)
- Practical and useful for real conversations
- Appropriate for language learners

Student is focusing on: ${language}`;

      // Build conversation context
      let fullPrompt = systemPrompt + '\n\n';
      
      // Add conversation history if provided
      if (history.length > 0) {
        fullPrompt += 'Previous conversation:\n';
        history.slice(-6).forEach((msg) => {
          fullPrompt += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}\n`;
        });
        fullPrompt += '\n';
      }

      fullPrompt += `Student: ${message.trim()}\nAssistant:`;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new HttpsError('internal', 'No response from AI');
      }

      return {
        response: text.trim(),
        language,
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new HttpsError('internal', `AI chat failed: ${error.message || 'unknown error'}`);
    }
  }
);
