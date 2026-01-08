import { doc, getDoc, serverTimestamp, setDoc, updateDoc, type DocumentData } from "firebase/firestore";
import { db } from "./firebase";
import { getDefaultRoleForEmail, isTeacherEmail, type AppRole } from "./roles";

export type UserProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  role: AppRole;
  providerIds: string[];
  // Teacher can store a reusable Zoom link (e.g., Personal Meeting link).
  zoomLink?: string | null;
  createdAt?: unknown;
  lastLoginAt?: unknown;
};

export async function updateMyZoomLink(input: { uid: string; zoomLink: string | null }): Promise<void> {
  await updateDoc(doc(db, "users", input.uid), {
    zoomLink: input.zoomLink ? input.zoomLink.trim() : null,
  });
}

export async function getUserProfileOnce(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function ensureUserProfileDoc(input: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  providerIds: string[];
}): Promise<UserProfile> {
  const userDocRef = doc(db, "users", input.uid);
  const existing = await getDoc(userDocRef);

  const existingData = (existing.exists() ? (existing.data() as DocumentData) : null) ?? null;
  const existingRole = (existingData?.role as AppRole | undefined) ?? undefined;

  const resolvedRole: AppRole =
    existingRole === "admin"
      ? "admin"
      : existingRole === "teacher"
        ? "teacher"
        : isTeacherEmail(input.email)
          ? "teacher"
          : getDefaultRoleForEmail(input.email);

  const profile: UserProfile = {
    uid: input.uid,
    displayName: input.displayName,
    email: input.email,
    photoURL: input.photoURL,
    phoneNumber: input.phoneNumber ?? null,
    emailVerified: input.emailVerified,
    role: resolvedRole,
    providerIds: input.providerIds,
    lastLoginAt: serverTimestamp(),
  };

  // Firestore rules forbid changing createdAt after initial creation.
  // So only write createdAt the very first time.
  if (!existing.exists()) {
    await setDoc(
      userDocRef,
      {
        ...profile,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    await setDoc(userDocRef, profile, { merge: true });
  }

  return profile;
}

const PREMIUM_ACCESS_KEY = 'lingualive_premium_access_v1';

export async function hasPremiumAccess(uid: string): Promise<boolean> {
  try {
    const raw = localStorage.getItem(PREMIUM_ACCESS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      return data.hasPremium === true;
    }
    return false;
  } catch {
    return false;
  }
}

