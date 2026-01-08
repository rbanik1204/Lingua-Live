import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export type HomeworkAssignment = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueAt?: unknown;
  createdByUid: string;
  createdAt?: unknown;
};

export type HomeworkSubmissionStatus = "submitted" | "reviewed";

export type HomeworkSubmission = {
  id: string; // uid
  courseId: string;
  homeworkId: string;
  userId: string;
  studentName: string;
  answerText: string;
  attachmentUrl: string | null;
  status: HomeworkSubmissionStatus;
  submittedAt?: unknown;
  reviewedAt?: unknown;
  teacherFeedback: string | null;
};

export function subscribeCourseHomework(courseId: string, onChange: (items: HomeworkAssignment[]) => void): Unsubscribe {
  const q = query(collection(db, "courses", courseId, "homework"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items: HomeworkAssignment[] = snap.docs.map((d) => {
      const data = d.data() as Omit<HomeworkAssignment, "id" | "courseId">;
      return {
        id: d.id,
        courseId,
        ...(data as any),
      };
    });
    onChange(items);
  });
}

export async function createHomework(input: {
  courseId: string;
  createdByUid: string;
  title: string;
  description: string;
  dueAt?: Date | null;
}): Promise<string> {
  const title = input.title.trim();
  const description = input.description.trim();

  const docRef = await addDoc(collection(db, "courses", input.courseId, "homework"), {
    title,
    description,
    createdByUid: input.createdByUid,
    createdAt: serverTimestamp(),
    ...(input.dueAt ? { dueAt: input.dueAt } : {}),
  });

  return docRef.id;
}

export function subscribeHomeworkSubmissions(
  input: { courseId: string; homeworkId: string },
  onChange: (items: HomeworkSubmission[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "courses", input.courseId, "homework", input.homeworkId, "submissions"),
    orderBy("submittedAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const items: HomeworkSubmission[] = snap.docs.map((d) => {
      const data = d.data() as Omit<HomeworkSubmission, "id" | "courseId" | "homeworkId">;
      return {
        id: d.id,
        courseId: input.courseId,
        homeworkId: input.homeworkId,
        ...(data as any),
      };
    });
    onChange(items);
  });
}

export function subscribeMyHomeworkSubmission(
  input: { courseId: string; homeworkId: string; userId: string },
  onChange: (submission: HomeworkSubmission | null) => void
): Unsubscribe {
  const ref = doc(db, "courses", input.courseId, "homework", input.homeworkId, "submissions", input.userId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    const data = snap.data() as Omit<HomeworkSubmission, "id" | "courseId" | "homeworkId">;
    onChange({
      id: snap.id,
      courseId: input.courseId,
      homeworkId: input.homeworkId,
      ...(data as any),
    });
  });
}

export async function submitHomework(input: {
  courseId: string;
  homeworkId: string;
  userId: string;
  studentName: string;
  answerText: string;
  attachmentUrl?: string | null;
}): Promise<void> {
  const ref = doc(db, "courses", input.courseId, "homework", input.homeworkId, "submissions", input.userId);

  await setDoc(
    ref,
    {
      userId: input.userId,
      studentName: input.studentName,
      answerText: input.answerText.trim(),
      attachmentUrl: input.attachmentUrl?.trim() ? input.attachmentUrl.trim() : null,
      status: "submitted" as HomeworkSubmissionStatus,
      submittedAt: serverTimestamp(),
      teacherFeedback: null,
      reviewedAt: null,
    },
    { merge: true }
  );
}

export async function reviewHomeworkSubmission(input: {
  courseId: string;
  homeworkId: string;
  userId: string;
  teacherFeedback: string;
}): Promise<void> {
  const ref = doc(db, "courses", input.courseId, "homework", input.homeworkId, "submissions", input.userId);
  await updateDoc(ref, {
    teacherFeedback: input.teacherFeedback.trim() || null,
    status: "reviewed" as HomeworkSubmissionStatus,
    reviewedAt: serverTimestamp(),
  });
}
