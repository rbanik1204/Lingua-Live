import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { NANDINI } from "../data/nandini";

export type CourseMeetingProvider = "zoom";
export type CourseMeetingStatus = "active" | "ended";

export type CourseMeeting = {
  id: string;
  courseId: string;
  provider: CourseMeetingProvider;
  joinUrl: string;
  status: CourseMeetingStatus;
  createdByUid: string;
  startedAt?: unknown;
  endedAt?: unknown;
  updatedAt?: unknown;
};

export function subscribeCourseMeeting(
  courseId: string,
  onChange: (meeting: CourseMeeting | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const ref = doc(db, "courseMeetings", courseId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      onChange({ id: snap.id, ...(snap.data() as Omit<CourseMeeting, "id">) });
    },
    (err) => {
      onError?.(err);
      onChange(null);
    }
  );
}

export async function startZoomMeeting(input: {
  courseId: string;
  createdByUid: string;
  joinUrl?: string; // Optional - will use permanent link if not provided
}): Promise<void> {
  // Use provided URL or fall back to permanent Zoom link
  const joinUrl = input.joinUrl?.trim() || NANDINI.permanentZoomMeeting.joinUrl;
  if (!joinUrl) throw new Error("Zoom link is required");

  await setDoc(
    doc(db, "courseMeetings", input.courseId),
    {
      courseId: input.courseId,
      provider: "zoom" as CourseMeetingProvider,
      joinUrl,
      status: "active" as CourseMeetingStatus,
      createdByUid: input.createdByUid,
      startedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function endCourseMeeting(input: { courseId: string }): Promise<void> {
  await updateDoc(doc(db, "courseMeetings", input.courseId), {
    status: "ended" as CourseMeetingStatus,
    endedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
