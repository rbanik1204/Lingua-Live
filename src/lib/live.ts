import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AppRole } from "./roles";

export type LiveSessionStatus = "active" | "ended";

export type LiveSession = {
  id: string;
  courseId: string;
  classId: string;
  status: LiveSessionStatus;
  startedByUid: string;
  startedAt?: unknown;
  endedAt?: unknown;
};

export type LiveMessage = {
  id: string;
  senderUid: string;
  senderName: string;
  senderRole: AppRole;
  text: string;
  createdAt?: unknown;
};

function randomClassId(): string {
  // 6-digit numeric ID
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function subscribeActiveSession(courseId: string, onChange: (session: LiveSession | null) => void): Unsubscribe {
  const q = query(
    collection(db, "liveSessions"),
    where("courseId", "==", courseId),
    where("status", "==", "active"),
    orderBy("startedAt", "desc"),
    limit(1)
  );

  return onSnapshot(q, (snap) => {
    const first = snap.docs[0];
    if (!first) {
      onChange(null);
      return;
    }
    onChange({ id: first.id, ...(first.data() as Omit<LiveSession, "id">) });
  });
}

export function subscribeLiveSessionById(
  sessionId: string,
  onChange: (session: LiveSession | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const ref = doc(db, "liveSessions", sessionId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      onChange({ id: snap.id, ...(snap.data() as Omit<LiveSession, "id">) });
    },
    (err) => {
      onError?.(err);
      onChange(null);
    }
  );
}

export function subscribeSessionMessages(sessionId: string, onChange: (messages: LiveMessage[]) => void): Unsubscribe {
  const q = query(
    collection(db, "liveSessions", sessionId, "messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snap) => {
    const msgs: LiveMessage[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LiveMessage, "id">) }));
    onChange(msgs);
  });
}

export async function startLiveSession(input: { courseId: string; startedByUid: string }): Promise<string> {
  const docRef = await addDoc(collection(db, "liveSessions"), {
    courseId: input.courseId,
    classId: randomClassId(),
    status: "active" as LiveSessionStatus,
    startedByUid: input.startedByUid,
    startedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function endLiveSession(sessionId: string): Promise<void> {
  await updateDoc(doc(db, "liveSessions", sessionId), {
    status: "ended" as LiveSessionStatus,
    endedAt: serverTimestamp(),
  });
}

export async function sendLiveMessage(input: {
  sessionId: string;
  senderUid: string;
  senderName: string;
  senderRole: AppRole;
  text: string;
}): Promise<void> {
  const trimmed = input.text.trim();
  if (!trimmed) return;

  await addDoc(collection(db, "liveSessions", input.sessionId, "messages"), {
    senderUid: input.senderUid,
    senderName: input.senderName,
    senderRole: input.senderRole,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
}
