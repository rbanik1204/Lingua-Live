import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  browserLocalPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth } from "../lib/firebase";
import { db } from "../lib/firebase";
import type { AppRole } from "../lib/roles";
import { getDefaultRoleForEmail, isTeacherEmail } from "../lib/roles";
import type { UserProfile } from "../lib/userProfile";
import { ensureUserProfileDoc } from "../lib/userProfile";

export type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  role: AppRole;
  loading: boolean;
  profileLoading: boolean;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    // Start listening immediately so we don't miss a fast sign-in.
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    // Best-effort persistence (do not block auth state listener).
    (async () => {
      try {
        await setPersistence(auth, indexedDBLocalPersistence);
      } catch {
        try {
          await setPersistence(auth, browserLocalPersistence);
        } catch {
          try {
            await setPersistence(auth, inMemoryPersistence);
          } catch {
            // ignore
          }
        }
      }
    })();

    return () => unsub();
  }, []);

  useEffect(() => {
    setProfile(null);
    if (!user) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);

    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        if (!snap.exists()) {
          // Safety: if the profile doc is missing (e.g., older accounts), create it.
          const providerIds = user.providerData
            .map((p) => p?.providerId)
            .filter(Boolean) as string[];

          const created = await ensureUserProfileDoc({
            uid: user.uid,
            displayName: user.displayName ?? null,
            email: user.email ?? null,
            photoURL: user.photoURL ?? null,
            phoneNumber: user.phoneNumber ?? null,
            emailVerified: user.emailVerified,
            providerIds,
          });
          setProfile(created);
          setProfileLoading(false);
          return;
        }

        const data = snap.data() as UserProfile;
        setProfile(data);
        setProfileLoading(false);

        // If this user is on the instructor allowlist but their stored profile still says
        // 'student' (older accounts), promote once so Firestore rules allow teacher actions.
        // Avoid calling ensureUserProfileDoc on every snapshot to prevent infinite write loops.
        if (data.role === "student" && isTeacherEmail(user.email)) {
          try {
            const providerIds = user.providerData
              .map((p) => p?.providerId)
              .filter(Boolean) as string[];

            await ensureUserProfileDoc({
              uid: user.uid,
              displayName: user.displayName ?? null,
              email: user.email ?? null,
              photoURL: user.photoURL ?? null,
              phoneNumber: user.phoneNumber ?? null,
              emailVerified: user.emailVerified,
              providerIds,
            });
          } catch {
            // If rules prevent it or network fails, UI will still work but teacher-only
            // actions may be denied. The UI will surface errors elsewhere.
          }
        }
      },
      () => {
        setProfileLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const value = useMemo<AuthContextValue>(() => {
    const role: AppRole = profile?.role ?? getDefaultRoleForEmail(user?.email);

    return {
      user,
      profile,
      role,
      loading,
      profileLoading,
      logout: async () => {
        await signOut(auth);
      },
      sendPasswordReset: async (email: string) => {
        const trimmed = email.trim();
        if (!trimmed) throw new Error("Please enter your email first");
        await sendPasswordResetEmail(auth, trimmed);
      },
      resendVerificationEmail: async () => {
        const current = auth.currentUser;
        if (!current) throw new Error("You must be signed in first");
        await sendEmailVerification(current);
      },
      refreshUser: async () => {
        const current = auth.currentUser;
        if (!current) return;
        await reload(current);
        setUser(auth.currentUser);
      },
    };
  }, [user, profile, loading, profileLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
