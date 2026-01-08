import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ScheduledClass {
  id: string;
  teacherId: string;
  studentName: string;
  studentEmail: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM format
  duration: number; // minutes
  topic?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export async function createScheduledClass(input: {
  teacherId: string;
  studentName: string;
  studentEmail: string;
  date: string;
  time: string;
  duration: number;
  topic?: string;
  notes?: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, 'scheduledClasses'), {
    ...input,
    status: 'scheduled',
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateScheduledClass(
  classId: string,
  updates: {
    studentName?: string;
    studentEmail?: string;
    date?: string;
    time?: string;
    duration?: number;
    topic?: string;
    notes?: string;
    status?: 'scheduled' | 'completed' | 'cancelled';
  }
): Promise<void> {
  const classRef = doc(db, 'scheduledClasses', classId);
  await updateDoc(classRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteScheduledClass(classId: string): Promise<void> {
  const classRef = doc(db, 'scheduledClasses', classId);
  await deleteDoc(classRef);
}

export function subscribeTeacherScheduledClasses(
  teacherId: string,
  onClasses: (classes: ScheduledClass[]) => void
): () => void {
  const q = query(
    collection(db, 'scheduledClasses'),
    where('teacherId', '==', teacherId),
    orderBy('date', 'asc'),
    orderBy('time', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const classes: ScheduledClass[] = [];
    snapshot.forEach((doc) => {
      classes.push({ id: doc.id, ...doc.data() } as ScheduledClass);
    });
    onClasses(classes);
  });
}

export function getUpcomingClasses(classes: ScheduledClass[]): ScheduledClass[] {
  const today = new Date().toISOString().split('T')[0];
  return classes.filter(
    (cls) => cls.status === 'scheduled' && cls.date >= today
  );
}

export function getThisWeekClasses(classes: ScheduledClass[]): ScheduledClass[] {
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().split('T')[0];
  const weekFromNowStr = weekFromNow.toISOString().split('T')[0];
  
  return classes.filter(
    (cls) => 
      cls.status === 'scheduled' && 
      cls.date >= todayStr && 
      cls.date <= weekFromNowStr
  );
}
