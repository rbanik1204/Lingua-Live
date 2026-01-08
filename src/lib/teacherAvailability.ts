import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  getDocs,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

export type BlockedSlot = {
  id: string;
  teacherId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // e.g., "08:00", "14:30"
  duration: number; // minutes
  reason?: string; // Optional reason for blocking
  createdAt?: unknown;
};

/**
 * Block a time slot so students cannot book it
 */
export async function blockTimeSlot(input: {
  teacherId: string;
  date: string;
  time: string;
  duration: number;
  reason?: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "blockedSlots"), {
    teacherId: input.teacherId,
    date: input.date,
    time: input.time,
    duration: input.duration,
    reason: input.reason || "",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Unblock a time slot (remove the block)
 */
export async function unblockTimeSlot(blockId: string): Promise<void> {
  await deleteDoc(doc(db, "blockedSlots", blockId));
}

/**
 * Subscribe to all blocked slots for a teacher
 */
export function subscribeTeacherBlockedSlots(
  teacherId: string,
  onChange: (slots: BlockedSlot[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, "blockedSlots"),
    where("teacherId", "==", teacherId)
  );

  return onSnapshot(
    q,
    (snap) => {
      const slots: BlockedSlot[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<BlockedSlot, "id">),
      }));
      onChange(slots);
    },
    (err) => {
      onError?.(err);
      onChange([]);
    }
  );
}

/**
 * Get all blocked slots for a specific date
 */
export async function getBlockedSlotsForDate(date: string): Promise<BlockedSlot[]> {
  const q = query(
    collection(db, "blockedSlots"),
    where("date", "==", date)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<BlockedSlot, "id">),
  }));
}

/**
 * Check if a specific slot is blocked by teacher
 */
export async function isSlotBlocked(date: string, time: string): Promise<boolean> {
  const blockedSlots = await getBlockedSlotsForDate(date);
  
  // Check if the exact time slot is blocked
  const isBlocked = blockedSlots.some((slot) => slot.time === time);
  
  return isBlocked;
}

/**
 * Get all unavailable slots for a date (blocked OR booked)
 * This combines both teacher blocks and student bookings
 */
export async function getUnavailableSlotsForDate(date: string): Promise<{
  blockedSlots: BlockedSlot[];
  bookedTimes: string[];
  allUnavailableTimes: Set<string>;
}> {
  // Import here to avoid circular dependency
  const { getConfirmedBookingsForDate } = await import('./bookings');
  
  const [blockedSlots, confirmedBookings] = await Promise.all([
    getBlockedSlotsForDate(date),
    getConfirmedBookingsForDate(date),
  ]);
  
  const bookedTimes = confirmedBookings.map((b) => b.time);
  const blockedTimes = blockedSlots.map((s) => s.time);
  
  const allUnavailableTimes = new Set([...bookedTimes, ...blockedTimes]);
  
  return {
    blockedSlots,
    bookedTimes,
    allUnavailableTimes,
  };
}
