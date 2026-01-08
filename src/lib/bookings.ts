import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

export type BookingStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export type Booking = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentUid?: string;
  date: string; // ISO date string
  time: string; // e.g., "08:00"
  duration: number; // minutes
  paymentMethod: "paypal" | "upi" | "phonepe" | "gpay";
  paymentProofUrl: string;
  amount: number;
  status: BookingStatus;
  bookingRef: string;
  notes?: string;
  createdAt?: unknown;
  confirmedAt?: unknown;
  rejectedAt?: unknown;
};

export async function createBooking(input: {
  studentName: string;
  studentEmail: string;
  studentUid?: string;
  date: string;
  time: string;
  duration: number;
  paymentMethod: "paypal" | "upi" | "phonepe" | "gpay";
  paymentProofUrl: string;
  amount: number;
  bookingRef: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "bookings"), {
    studentName: input.studentName,
    studentEmail: input.studentEmail,
    studentUid: input.studentUid || null,
    date: input.date,
    time: input.time,
    duration: input.duration,
    paymentMethod: input.paymentMethod,
    paymentProofUrl: input.paymentProofUrl,
    amount: input.amount,
    status: "pending" as BookingStatus,
    bookingRef: input.bookingRef,
    notes: "",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function confirmBooking(bookingId: string): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "confirmed" as BookingStatus,
    confirmedAt: serverTimestamp(),
  });
}

export async function rejectBooking(bookingId: string, notes?: string): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "rejected" as BookingStatus,
    rejectedAt: serverTimestamp(),
    notes: notes || "",
  });
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "cancelled" as BookingStatus,
  });
}

export function subscribeAllBookings(
  onChange: (bookings: Booking[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, "bookings"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const bookings: Booking[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Booking, "id">),
      }));
      onChange(bookings);
    },
    (err) => {
      onError?.(err);
      onChange([]);
    }
  );
}

export function subscribeMyBookings(
  email: string,
  onChange: (bookings: Booking[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(
    collection(db, "bookings"),
    where("studentEmail", "==", email),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const bookings: Booking[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Booking, "id">),
      }));
      onChange(bookings);
    },
    (err) => {
      onError?.(err);
      onChange([]);
    }
  );
}

// Get confirmed bookings for a specific date to check availability
export async function getConfirmedBookingsForDate(date: string): Promise<Booking[]> {
  const q = query(
    collection(db, "bookings"),
    where("date", "==", date),
    where("status", "==", "confirmed")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Booking, "id">),
  }));
}

// Check if a specific slot is available
export async function isSlotAvailable(date: string, time: string): Promise<boolean> {
  const confirmedBookings = await getConfirmedBookingsForDate(date);
  
  // Check if the exact time slot is already booked
  const isBooked = confirmedBookings.some((booking) => booking.time === time);
  
  return !isBooked;
}
