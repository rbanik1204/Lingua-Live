import {
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  setPersistence,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { ensureUserProfileDoc } from "./userProfile";
import { isTeacherEmail, type AppRole } from "./roles";

export type AppUserProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  role?: AppRole;
  providerIds: string[];
  createdAt?: unknown;
  lastLoginAt?: unknown;
};

async function upsertUserProfile(user: User, extra?: { phoneNumber?: string | null }) {
  const providerIds = user.providerData.map((p) => p?.providerId).filter(Boolean) as string[];

  const profile = await ensureUserProfileDoc({
    uid: user.uid,
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    photoURL: user.photoURL ?? null,
    phoneNumber: extra?.phoneNumber ?? user.phoneNumber ?? null,
    emailVerified: user.emailVerified,
    providerIds,
  });

  return profile;
}

function isWebStorageAvailable(type: "localStorage" | "sessionStorage"): boolean {
  try {
    if (typeof window === "undefined") return false;
    const storage = window[type];
    const key = "__lingualive_storage_test__";
    storage.setItem(key, "1");
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function throwHelpfulAuthStorageError() {
  throw new Error(
    "Google sign-in can't start because browser storage is blocked. " +
      "Please allow cookies/site data (including sessionStorage) and try again, or open the site in a normal browser tab (Chrome/Edge) instead of an in-app browser."
  );
}

async function ensureBestEffortAuthPersistence(): Promise<void> {
  // Goal: persist auth across reloads whenever the browser allows it.
  // Try IndexedDB first (more reliable in privacy-restricted contexts), then localStorage, then memory.
  try {
    await setPersistence(auth, indexedDBLocalPersistence);
    return;
  } catch {
    // ignore
  }

  try {
    await setPersistence(auth, browserLocalPersistence);
    return;
  } catch {
    // ignore
  }

  try {
    await setPersistence(auth, inMemoryPersistence);
  } catch {
    // ignore
  }
}

function isStorageRelatedAuthError(err: unknown): boolean {
  const anyErr = err as { code?: unknown; message?: unknown };
  const code = typeof anyErr?.code === 'string' ? anyErr.code : '';
  const msg = typeof anyErr?.message === 'string' ? anyErr.message : '';

  return (
    code === 'auth/web-storage-unsupported' ||
    code === 'auth/operation-not-supported-in-this-environment' ||
    msg.toLowerCase().includes('missing initial state') ||
    msg.toLowerCase().includes('storage')
  );
}

export async function continueWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const sessionOk = isWebStorageAvailable("sessionStorage");
  if (!sessionOk) {
    // Popup/redirect flows rely on sessionStorage for the OAuth state.
    throwHelpfulAuthStorageError();
  }

  // Ensure refresh persistence whenever possible.
  await ensureBestEffortAuthPersistence();

  try {
    const cred = await signInWithPopup(auth, provider);
    const profile = await upsertUserProfile(cred.user);
    return { user: cred.user, role: profile.role };
  } catch (e) {
    if (isStorageRelatedAuthError(e)) {
      throwHelpfulAuthStorageError();
    }

    throw e;
  }
}

async function enforceInstructorEmail(user: User): Promise<void> {
  const email = user.email ?? "";
  if (isTeacherEmail(email)) return;

  try {
    await signOut(auth);
  } catch {
    // ignore
  }

  throw new Error(
    "This is the Instructor sign-in. Please use an authorized instructor email only."
  );
}

export async function continueWithGoogleInstructor() {
  const result = await continueWithGoogle();
  await enforceInstructorEmail(result.user);
  return result;
}

export async function signInWithEmailInstructor(usernameOrEmail: string, password: string) {
  const result = await signInWithEmail(usernameOrEmail, password);
  await enforceInstructorEmail(result.user);
  return result;
}

export async function signInWithEmail(usernameOrEmail: string, password: string) {
  await ensureBestEffortAuthPersistence();
  const email = usernameOrEmail.trim();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const profile = await upsertUserProfile(cred.user);
  return { user: cred.user, role: profile.role };
}

export async function registerWithEmail(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  await ensureBestEffortAuthPersistence();
  const email = input.email.trim();

  const cred = await createUserWithEmailAndPassword(auth, email, input.password);

  await updateProfile(cred.user, {
    displayName: input.fullName.trim(),
  });

  const profile = await upsertUserProfile(cred.user, {
    phoneNumber: input.phone.trim() || null,
  });

  return { user: cred.user, role: profile.role };
}

export type AuthResult = { user: User; role: AppRole };
