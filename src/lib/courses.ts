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
  deleteDoc,
  type QueryConstraint,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export type CourseLanguage = "Bengali" | "Hindi" | "English";

export type Course = {
  id: string;
  title: string;
  description: string;
  language: CourseLanguage;
  createdByUid: string;
  isPublished: boolean;
  startDate?: string; // ISO date string (optional)
  startTime?: string; // HH:MM format (optional)
  duration?: number; // minutes (optional)
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Enrollment = {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt?: unknown;
};

export function subscribePublishedCourses(onChange: (courses: Course[]) => void): Unsubscribe {
  const q = query(collection(db, "courses"), where("isPublished", "==", true), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const courses: Course[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Course, "id">) }));
    onChange(courses);
  });
}

export function subscribeTeacherCourses(uid: string, onChange: (courses: Course[]) => void): Unsubscribe {
  const q = query(
    collection(db, "courses"),
    where("createdByUid", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const courses: Course[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Course, "id">) }));
    onChange(courses);
  });
}

export function subscribeMyEnrollments(uid: string, onChange: (enrollments: Enrollment[]) => void): Unsubscribe {
  const q = query(collection(db, "enrollments"), where("userId", "==", uid));

  return onSnapshot(q, (snap) => {
    const enrollments: Enrollment[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Enrollment, "id">),
    }));
    onChange(enrollments);
  });
}

export function subscribeEnrollmentsForCourses(
  courseIds: string[],
  onChange: (enrollments: Enrollment[]) => void
): Unsubscribe {
  const unique = Array.from(new Set(courseIds.filter(Boolean)));
  if (unique.length === 0) {
    onChange([]);
    return () => {};
  }

  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 10) {
    chunks.push(unique.slice(i, i + 10));
  }

  const combined = new Map<string, Enrollment>();
  const unsubs: Unsubscribe[] = [];

  const emit = () => {
    onChange(Array.from(combined.values()));
  };

  for (const chunk of chunks) {
    const constraints: QueryConstraint[] = [where("courseId", "in", chunk)];
    const q = query(collection(db, "enrollments"), ...constraints);

    const unsub = onSnapshot(q, (snap) => {
      // Rebuild this chunk portion to avoid stale data.
      const keepKeys = new Set<string>();
      for (const docSnap of snap.docs) {
        keepKeys.add(docSnap.id);
      }

      // Remove old enrollments that belonged to this chunk but no longer exist.
      for (const [id, enr] of combined.entries()) {
        if (chunk.includes(enr.courseId) && !keepKeys.has(id)) {
          combined.delete(id);
        }
      }

      for (const docSnap of snap.docs) {
        const data = docSnap.data() as Omit<Enrollment, "id">;
        combined.set(docSnap.id, { id: docSnap.id, ...(data as any) });
      }
      emit();
    });

    unsubs.push(unsub);
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}

export async function createCourse(input: {
  createdByUid: string;
  title: string;
  description: string;
  language: CourseLanguage;
  isPublished?: boolean;
  startDate?: string;
  startTime?: string;
  duration?: number;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "courses"), {
    createdByUid: input.createdByUid,
    title: input.title.trim(),
    description: input.description.trim(),
    language: input.language,
    isPublished: input.isPublished ?? true,
    startDate: input.startDate || null,
    startTime: input.startTime || null,
    duration: input.duration || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCourse(courseId: string, input: {
  title?: string;
  description?: string;
  language?: CourseLanguage;
  isPublished?: boolean;
  startDate?: string;
  startTime?: string;
  duration?: number;
}): Promise<void> {
  const updates: any = {
    updatedAt: serverTimestamp(),
  };
  
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description.trim();
  if (input.language !== undefined) updates.language = input.language;
  if (input.isPublished !== undefined) updates.isPublished = input.isPublished;
  if (input.startDate !== undefined) updates.startDate = input.startDate || null;
  if (input.startTime !== undefined) updates.startTime = input.startTime || null;
  if (input.duration !== undefined) updates.duration = input.duration || null;
  
  await updateDoc(doc(db, "courses", courseId), updates);
}

export async function deleteCourse(courseId: string): Promise<void> {
  await deleteDoc(doc(db, "courses", courseId));
}

export async function enrollInCourse(input: { courseId: string; userId: string }): Promise<void> {
  const id = `${input.courseId}__${input.userId}`;
  await setDoc(
    doc(db, "enrollments", id),
    {
      courseId: input.courseId,
      userId: input.userId,
      enrolledAt: serverTimestamp(),
    },
    { merge: true }
  );
}
