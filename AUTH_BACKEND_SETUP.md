# Auth + Backend Storage Setup (Firebase)

This project uses **Firebase Authentication** (Google + Email/Password) and **Firestore** (roles, courses, live chat metadata).

Note: **Recordings / Storage uploads are intentionally not included** in the current MVP (live lectures only).

## 1) Create Firebase Project

1. Go to Firebase Console and create a new project.
2. In **Project settings → General → Your apps**, add a **Web app**.
3. Copy the Firebase config values.

## 2) Enable Sign-In Methods

In **Build → Authentication → Sign-in method**:
- Enable **Google**
- Enable **Email/Password**

Also verify **Authorized domains** includes:
- `localhost`

## 3) Create Firestore Database

In **Build → Firestore Database**:
- Create a database (production or test mode is fine for initial setup)

This app uses these collections:

- `users/{uid}` (profile + `role`)
- `courses/{courseId}` (created by teacher)
- `enrollments/{courseId}__{uid}` (student enrollments)
- `liveSessions/{sessionId}` (active/ended sessions)
- `liveSessions/{sessionId}/messages/{messageId}` (live chat)
// Recordings are not used in this MVP.

Important:
- `role` is used for access control. Default: teacher email => `teacher`, otherwise `student`.
- If you want an `admin`, set `users/{uid}.role = "admin"` manually in Firestore Console.

## 4) Add Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill values from Firebase Console:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...  # optional (Analytics)
```

Restart dev server after changing env:
- `npm run dev`

## 4b) Live Class Video Provider (Jitsi)

This app embeds Jitsi via the IFrame API.

Important: the public `meet.jit.si` service can enable server-side features like **Visitors/Lobby** or **secure-domain moderators**, which can lead to the screen:

> “conference has not yet started because no moderators have yet arrived… Log in”

If that happens, it cannot be reliably fixed from the frontend alone; you need a Jitsi deployment where **the host can be moderator** (self-hosted Jitsi, or Jitsi as a Service with JWT).

Configure these optional env vars in `.env.local`:

```
VITE_JITSI_DOMAIN=meet.jit.si
VITE_JITSI_ROOM_NAME_PREFIX=
```

- `VITE_JITSI_DOMAIN`: your Jitsi domain (e.g. `meet.yourdomain.com`). Default is `meet.jit.si`.
- `VITE_JITSI_ROOM_NAME_PREFIX`: optional tenant prefix for deployments that require it (common with JaaS).

For a full production setup where the teacher is **guaranteed moderator**, see:
- `SELF_HOSTED_JITSI_JWT_SETUP.md`

## 5) Recommended Firestore Rules

This repo includes rules files:

- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`

Deploy them with:

```bash
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```

If you prefer to paste manually, use the content of `firestore.rules` in Firebase Console → Firestore → Rules.

Note: some queries (live sessions sorting + filtering) require composite indexes. This is already defined in `firestore.indexes.json`.

## 6) (Optional later) Firebase Storage

If you later add class recordings, you can enable Firebase Storage and add storage rules.

## Where the Code Lives

- Firebase init: `src/lib/firebase.ts`
- Auth + user upsert: `src/lib/auth.ts`
- User profile + role enforcement: `src/lib/userProfile.ts` + `src/context/AuthContext.tsx`
- Courses + enrollments: `src/lib/courses.ts`
- Live sessions + chat: `src/lib/live.ts`
// Recordings are not used in this MVP.
- UI: `src/components/AuthPage.tsx`

On successful sign-in, the app upserts the user profile into Firestore `users/{uid}`.
