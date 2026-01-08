import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  addDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AppRole } from "./roles";

export type LiveParticipant = {
  id: string; // uid
  uid: string;
  name: string;
  role: AppRole;
  joinedAt?: unknown;
  lastSeenAt?: unknown;
  kicked?: boolean;
  kickedAt?: unknown;
  handRaised?: boolean;
  handRaisedAt?: unknown;
};

export type LiveBan = {
  id: string; // uid
  uid: string;
  reason: string | null;
  bannedAt?: unknown;
  bannedByUid: string;
};

export type LiveReport = {
  id: string;
  messageId: string;
  messageText: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedByUid: string;
  reportedByName: string;
  reason: string;
  createdAt?: unknown;
  status: "open" | "resolved";
  resolvedAt?: unknown;
  resolvedByUid?: string | null;
};

export function upsertLiveParticipant(input: {
  sessionId: string;
  uid: string;
  name: string;
  role: AppRole;
}): Promise<void> {
  const ref = doc(db, "liveSessions", input.sessionId, "participants", input.uid);
  return setDoc(
    ref,
    {
      uid: input.uid,
      name: input.name,
      role: input.role,
      joinedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
      kicked: false,
      kickedAt: null,
      handRaised: false,
      handRaisedAt: null,
    },
    { merge: true }
  );
}

export function setHandRaised(input: { sessionId: string; uid: string; raised: boolean }): Promise<void> {
  const ref = doc(db, "liveSessions", input.sessionId, "participants", input.uid);
  return updateDoc(ref, {
    handRaised: input.raised,
    handRaisedAt: input.raised ? serverTimestamp() : null,
  });
}

export function heartbeatLiveParticipant(input: { sessionId: string; uid: string }): Promise<void> {
  const ref = doc(db, "liveSessions", input.sessionId, "participants", input.uid);
  return updateDoc(ref, { lastSeenAt: serverTimestamp() });
}

export function subscribeParticipants(sessionId: string, onChange: (items: LiveParticipant[]) => void): Unsubscribe {
  const q = query(collection(db, "liveSessions", sessionId, "participants"), orderBy("joinedAt", "asc"));
  return onSnapshot(q, (snap) => {
    const items: LiveParticipant[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<LiveParticipant, "id">),
    }));
    onChange(items);
  });
}

export function subscribeMyParticipant(
  input: { sessionId: string; uid: string },
  onChange: (p: LiveParticipant | null) => void
): Unsubscribe {
  const ref = doc(db, "liveSessions", input.sessionId, "participants", input.uid);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    onChange({ id: snap.id, ...(snap.data() as Omit<LiveParticipant, "id">) });
  });
}

export async function kickParticipant(input: { sessionId: string; uid: string; kicked: boolean }): Promise<void> {
  const ref = doc(db, "liveSessions", input.sessionId, "participants", input.uid);
  await updateDoc(ref, {
    kicked: input.kicked,
    kickedAt: input.kicked ? serverTimestamp() : null,
  });
}

export async function banFromChat(input: {
  sessionId: string;
  uid: string;
  bannedByUid: string;
  reason?: string | null;
}): Promise<void> {
  const ref = doc(db, "liveSessions", input.sessionId, "bans", input.uid);
  await setDoc(
    ref,
    {
      uid: input.uid,
      bannedByUid: input.bannedByUid,
      reason: input.reason?.trim() || null,
      bannedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function unbanFromChat(input: { sessionId: string; uid: string }): Promise<void> {
  const ref = doc(db, "liveSessions", input.sessionId, "bans", input.uid);
  await deleteDoc(ref);
}

export function subscribeBans(sessionId: string, onChange: (items: LiveBan[]) => void): Unsubscribe {
  const q = query(collection(db, "liveSessions", sessionId, "bans"), orderBy("bannedAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items: LiveBan[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LiveBan, "id">) }));
    onChange(items);
  });
}

export async function reportLiveMessage(input: {
  sessionId: string;
  messageId: string;
  messageText: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedByUid: string;
  reportedByName: string;
  reason: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "liveSessions", input.sessionId, "reports"), {
    messageId: input.messageId,
    messageText: input.messageText,
    reportedUserId: input.reportedUserId,
    reportedUserName: input.reportedUserName,
    reportedByUid: input.reportedByUid,
    reportedByName: input.reportedByName,
    reason: input.reason.trim(),
    status: "open" as const,
    createdAt: serverTimestamp(),
    resolvedAt: null,
    resolvedByUid: null,
  });
  return docRef.id;
}

export function subscribeReports(sessionId: string, onChange: (items: LiveReport[]) => void): Unsubscribe {
  const q = query(collection(db, "liveSessions", sessionId, "reports"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items: LiveReport[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LiveReport, "id">) }));
    onChange(items);
  });
}

export async function resolveReport(input: { sessionId: string; reportId: string; resolvedByUid: string }): Promise<void> {
  const ref = doc(db, "liveSessions", input.sessionId, "reports", input.reportId);
  await updateDoc(ref, {
    status: "resolved" as const,
    resolvedAt: serverTimestamp(),
    resolvedByUid: input.resolvedByUid,
  });
}
