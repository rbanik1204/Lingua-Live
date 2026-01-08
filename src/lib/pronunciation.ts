import {
  addDoc,
  doc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  updateDoc,
  deleteDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export type PronunciationLanguage = 'Bengali' | 'Hindi' | 'English';
export type PronunciationItemType = 'letter' | 'word' | 'sentence';

export type PronunciationItem = {
  id: string;
  language: PronunciationLanguage;
  type: PronunciationItemType;
  targetText: string;
  english?: string;
  romanization?: string;
  createdByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type PronunciationSubmissionStatus = 'submitted' | 'reviewed';

export type PronunciationSubmission = {
  id: string;
  itemId: string;
  language: PronunciationLanguage;
  type: PronunciationItemType;
  targetText: string;
  userId: string;
  studentName: string;
  audioUrl: string;
  storagePath: string;
  mimeType: string;
  durationMs?: number;
  status: PronunciationSubmissionStatus;
  teacherReviewedAt?: unknown;
  createdAt?: unknown;
};

export function subscribePronunciationItems(
  params: { language: PronunciationLanguage; type: PronunciationItemType },
  onItems: (items: PronunciationItem[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'pronunciationItems'),
    where('language', '==', params.language),
    where('type', '==', params.type),
    orderBy('targetText', 'asc'),
    // Keep this >= 1000 so the full seeded library can be visible when imported.
    limit(1200)
  );

  return onSnapshot(
    q,
    (snap) => {
      onItems(
        snap.docs.map((d) => {
          const data = d.data() as Omit<PronunciationItem, 'id'>;
          return { id: d.id, ...data };
        })
      );
    },
    (err) => onError?.(err)
  );
}

export async function createPronunciationItem(input: {
  language: PronunciationLanguage;
  type: PronunciationItemType;
  targetText: string;
  english?: string;
  romanization?: string;
  createdByUid: string;
}): Promise<string> {
  const cleanedTarget = input.targetText.trim();
  if (!cleanedTarget) throw new Error('Target text is required');

  const docRef = await addDoc(collection(db, 'pronunciationItems'), {
    language: input.language,
    type: input.type,
    targetText: cleanedTarget,
    english: input.english?.trim() || '',
    romanization: input.romanization?.trim() || '',
    createdByUid: input.createdByUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updatePronunciationItem(
  itemId: string,
  updates: {
    targetText?: string;
    english?: string;
    romanization?: string;
  }
): Promise<void> {
  const docRef = doc(db, 'pronunciationItems', itemId);
  const data: any = { updatedAt: serverTimestamp() };
  
  if (updates.targetText !== undefined) data.targetText = updates.targetText.trim();
  if (updates.english !== undefined) data.english = updates.english.trim();
  if (updates.romanization !== undefined) data.romanization = updates.romanization.trim();
  
  await updateDoc(docRef, data);
}

export async function deletePronunciationItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'pronunciationItems', itemId));
}

function fnv1a32(input: string): string {
  // Deterministic non-crypto hash for stable IDs.
  // Returns 8-char hex.
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // Convert to unsigned 32-bit
  const u = hash >>> 0;
  return u.toString(16).padStart(8, '0');
}

export function getPronunciationItemDeterministicId(params: {
  language: PronunciationLanguage;
  type: PronunciationItemType;
  targetText: string;
}): string {
  const normalized = `${params.language}|${params.type}|${params.targetText.trim()}`;
  return `seed_${fnv1a32(normalized)}`;
}

export async function upsertPronunciationItem(input: {
  id?: string;
  language: PronunciationLanguage;
  type: PronunciationItemType;
  targetText: string;
  english?: string;
  romanization?: string;
  createdByUid: string;
}): Promise<string> {
  const cleanedTarget = input.targetText.trim();
  if (!cleanedTarget) throw new Error('Target text is required');

  const id = input.id ?? getPronunciationItemDeterministicId({
    language: input.language,
    type: input.type,
    targetText: cleanedTarget,
  });

  await setDoc(
    doc(db, 'pronunciationItems', id),
    {
      language: input.language,
      type: input.type,
      targetText: cleanedTarget,
      english: input.english?.trim() || '',
      romanization: input.romanization?.trim() || '',
      createdByUid: input.createdByUid,
      // Keep existing createdAt if present; otherwise set it.
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return id;
}

export async function importPronunciationSeedItems(input: {
  items: Array<{
    language: PronunciationLanguage;
    type: PronunciationItemType;
    targetText: string;
    english?: string;
    romanization?: string;
  }>;
  createdByUid: string;
}): Promise<{ imported: number }> {
  const cleaned = input.items
    .map((i) => ({
      ...i,
      targetText: i.targetText.trim(),
      english: i.english?.trim() || '',
      romanization: i.romanization?.trim() || '',
    }))
    .filter((i) => i.targetText);

  if (cleaned.length === 0) return { imported: 0 };

  // Firestore batch limit: 500 writes.
  // Keep headroom for safety and commit in chunks.
  const CHUNK = 450;
  let imported = 0;

  for (let offset = 0; offset < cleaned.length; offset += CHUNK) {
    const slice = cleaned.slice(offset, offset + CHUNK);
    if (slice.length === 0) break;

    const batch = writeBatch(db);
    for (const item of slice) {
      const id = getPronunciationItemDeterministicId({
        language: item.language,
        type: item.type,
        targetText: item.targetText,
      });
      batch.set(
        doc(db, 'pronunciationItems', id),
        {
          language: item.language,
          type: item.type,
          targetText: item.targetText,
          english: item.english,
          romanization: item.romanization,
          createdByUid: input.createdByUid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
    await batch.commit();
    imported += slice.length;
  }

  return { imported };
}

export function subscribePronunciationSubmissions(
  params: { limitCount?: number },
  onSubmissions: (items: PronunciationSubmission[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'pronunciationSubmissions'),
    orderBy('createdAt', 'desc'),
    limit(params.limitCount ?? 50)
  );

  return onSnapshot(
    q,
    (snap) => {
      onSubmissions(
        snap.docs.map((d) => {
          const data = d.data() as Omit<PronunciationSubmission, 'id'>;
          return { id: d.id, ...data };
        })
      );
    },
    (err) => onError?.(err)
  );
}

export async function uploadPronunciationRecording(params: {
  userId: string;
  submissionId: string;
  blob: Blob;
}): Promise<{ audioUrl: string; storagePath: string; mimeType: string }>
{
  const safeExt = 'webm';
  const storagePath = `pronunciationRecordings/${params.userId}/${params.submissionId}.${safeExt}`;
  const objectRef = ref(storage, storagePath);

  await uploadBytes(objectRef, params.blob, {
    contentType: params.blob.type || 'audio/webm',
    cacheControl: 'public,max-age=31536000',
  });

  const audioUrl = await getDownloadURL(objectRef);
  return { audioUrl, storagePath, mimeType: params.blob.type || 'audio/webm' };
}

export async function createPronunciationSubmission(input: {
  itemId: string;
  language: PronunciationLanguage;
  type: PronunciationItemType;
  targetText: string;
  userId: string;
  studentName: string;
  audioUrl: string;
  storagePath: string;
  mimeType: string;
  durationMs?: number;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'pronunciationSubmissions'), {
    itemId: input.itemId,
    language: input.language,
    type: input.type,
    targetText: input.targetText,
    userId: input.userId,
    studentName: input.studentName,
    audioUrl: input.audioUrl,
    storagePath: input.storagePath,
    mimeType: input.mimeType,
    durationMs: input.durationMs ?? null,
    status: 'submitted' as PronunciationSubmissionStatus,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function markPronunciationSubmissionReviewed(submissionId: string): Promise<void> {
  await updateDoc(doc(db, 'pronunciationSubmissions', submissionId), {
    status: 'reviewed' as PronunciationSubmissionStatus,
    teacherReviewedAt: serverTimestamp(),
  });
}

// ============ Daily Quiz System ============

export type DailyQuiz = {
  id: string;
  language: PronunciationLanguage;
  type: PronunciationItemType;
  question: string;
  correctAnswer: string;
  options: string[];
  hint?: string;
  date: string; // YYYY-MM-DD
  createdByUid: string;
  createdAt?: unknown;
};

export type QuizAnswer = {
  id: string;
  quizId: string;
  userId: string;
  studentName: string;
  answer: string;
  isCorrect: boolean;
  answeredAt?: unknown;
};

export async function createDailyQuiz(input: {
  language: PronunciationLanguage;
  type: PronunciationItemType;
  question: string;
  correctAnswer: string;
  options: string[];
  hint?: string;
  date: string;
  createdByUid: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'dailyQuizzes'), {
    language: input.language,
    type: input.type,
    question: input.question,
    correctAnswer: input.correctAnswer,
    options: input.options,
    hint: input.hint || '',
    date: input.date,
    createdByUid: input.createdByUid,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateDailyQuiz(
  quizId: string,
  updates: {
    question?: string;
    correctAnswer?: string;
    options?: string[];
    hint?: string;
  }
): Promise<void> {
  const docRef = doc(db, 'dailyQuizzes', quizId);
  await updateDoc(docRef, { ...updates });
}

export async function deleteDailyQuiz(quizId: string): Promise<void> {
  await deleteDoc(doc(db, 'dailyQuizzes', quizId));
}

export function subscribeDailyQuizzes(
  date: string,
  onQuizzes: (quizzes: DailyQuiz[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'dailyQuizzes'),
    where('date', '==', date),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      onQuizzes(
        snap.docs.map((d) => {
          const data = d.data() as Omit<DailyQuiz, 'id'>;
          return { id: d.id, ...data };
        })
      );
    },
    (err) => onError?.(err)
  );
}

export async function submitQuizAnswer(input: {
  quizId: string;
  userId: string;
  studentName: string;
  answer: string;
  isCorrect: boolean;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'quizAnswers'), {
    quizId: input.quizId,
    userId: input.userId,
    studentName: input.studentName,
    answer: input.answer,
    isCorrect: input.isCorrect,
    answeredAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeQuizAnswers(
  quizId: string,
  onAnswers: (answers: QuizAnswer[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'quizAnswers'),
    where('quizId', '==', quizId),
    orderBy('answeredAt', 'asc')
  );

  return onSnapshot(
    q,
    (snap) => {
      onAnswers(
        snap.docs.map((d) => {
          const data = d.data() as Omit<QuizAnswer, 'id'>;
          return { id: d.id, ...data };
        })
      );
    },
    (err) => onError?.(err)
  );
}

// ============ Shoutout System ============

export type Shoutout = {
  id: string;
  studentName: string;
  userId: string;
  message: string;
  category: 'quiz' | 'pronunciation' | 'achievement' | 'general';
  createdByUid: string;
  createdAt?: unknown;
};

export async function createShoutout(input: {
  studentName: string;
  userId: string;
  message: string;
  category: 'quiz' | 'pronunciation' | 'achievement' | 'general';
  createdByUid: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'shoutouts'), {
    studentName: input.studentName,
    userId: input.userId,
    message: input.message,
    category: input.category,
    createdByUid: input.createdByUid,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteShoutout(shoutoutId: string): Promise<void> {
  await deleteDoc(doc(db, 'shoutouts', shoutoutId));
}

export function subscribeShoutouts(
  onShoutouts: (shoutouts: Shoutout[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, 'shoutouts'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snap) => {
      onShoutouts(
        snap.docs.map((d) => {
          const data = d.data() as Omit<Shoutout, 'id'>;
          return { id: d.id, ...data };
        })
      );
    },
    (err) => onError?.(err)
  );
}
