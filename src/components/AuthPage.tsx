import { useMemo, useState } from "react";
import { Globe, Lock, ShieldCheck, Star, Users } from "lucide-react";
import {
  continueWithGoogle,
  continueWithGoogleInstructor,
  registerWithEmail,
  signInWithEmail,
  signInWithEmailInstructor,
} from "../lib/auth";
import { useAuth } from "../context/AuthContext";
import { TESTIMONIALS } from "../data/testimonials";
import { normalizeRedirect } from "../lib/roles";
import { NANDINI } from "../data/nandini";

interface AuthPageProps {
  onNavigate: (page: string, options?: { allowUnauthed?: boolean }) => void;
  redirectTo?: string;
}

type AuthTab = "sign-in" | "register";

type SignInForm = {
  username: string;
  password: string;
};

type RegisterForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

function toFriendlyAuthError(err: unknown, fallback: string): string {
  const message = err instanceof Error ? err.message : "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("missing initial state") ||
    normalized.includes("sessionstorage") ||
    normalized.includes("storage-partitioned")
  ) {
    return (
      "Google sign-in is blocked by your browser/app privacy settings (site storage is not available). " +
      "Open this site in Chrome/Edge/Safari (not inside Instagram/FB/WhatsApp in-app browser) and allow cookies/site data, then try again."
    );
  }

  if (message) return message;
  return fallback;
}

export function AuthPage({ onNavigate, redirectTo = "student-dashboard" }: AuthPageProps) {
  const [tab, setTab] = useState<AuthTab>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const { user, sendPasswordReset, resendVerificationEmail, refreshUser } = useAuth();

  const reviewCount = TESTIMONIALS.length;
  const averageRating =
    reviewCount > 0
      ? TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / reviewCount
      : 5;

  const [signIn, setSignIn] = useState<SignInForm>({
    username: "",
    password: "",
  });

  const [register, setRegister] = useState<RegisterForm>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const registerPasswordMismatch = useMemo(() => {
    if (!register.password || !register.confirmPassword) return false;
    return register.password !== register.confirmPassword;
  }, [register.password, register.confirmPassword]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="w-full border-b border-indigo-100 bg-white/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
          >
            Back
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl text-indigo-900">LinguaLive</span>
          </div>

          <div className="w-[72px]" />
        </div>
      </nav>

      <main className="px-6 py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-44 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left: Trust + value */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-indigo-200 mb-6">
                <Lock className="w-4 h-4 text-indigo-700" />
                <span className="text-sm text-indigo-700">Secure sign in • Your data stays private</span>
              </div>

              <h1 className="text-4xl md:text-6xl text-slate-900 tracking-tight mb-4">
                Sign in to continue learning
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Join Zoom & Meet classes, practice pronunciation, and learn faster — all in one place.
              </p>

              <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-2xl">
                <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-indigo-700 mt-0.5" />
                    <div>
                      <div className="text-slate-900">Trusted login</div>
                      <div className="text-sm text-slate-600">Google or email/password</div>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-indigo-700 mt-0.5" />
                    <div>
                      <div className="text-slate-900">Account history</div>
                      <div className="text-sm text-slate-600">Progress saved automatically</div>
                    </div>
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white/60 backdrop-blur-sm border border-indigo-100 sm:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="text-slate-900">Student reviews</div>
                        <div className="text-sm text-slate-600">
                          {reviewCount} review{reviewCount === 1 ? "" : "s"} • {averageRating.toFixed(1)} / 5.0
                        </div>
                      </div>
                    </div>
                    <div className="text-indigo-700 text-sm">Top-rated teaching</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Auth card */}
            <div className="lg:col-span-5">
              <div className="text-center lg:text-left mb-6">
                <h2 className="text-2xl text-slate-900">Welcome back</h2>
                <p className="text-slate-600">Sign in, register, or continue with Google</p>
              </div>

              <div className="p-[1px] rounded-3xl bg-gradient-to-br from-indigo-200 via-purple-200 to-cyan-200">
                <div className="p-7 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/60">
                  {infoMessage && (
                    <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-800">
                      {infoMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">
                      {errorMessage}
                    </div>
                  )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setErrorMessage(null);
                      setInfoMessage(null);
                      setIsSubmitting(true);
                      await continueWithGoogle();
                      // Auth state change will trigger auto-redirect
                    } catch (e) {
                      setErrorMessage(toFriendlyAuthError(e, "Google sign-in failed"));
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-6 py-3 rounded-2xl border transition-all ${
                    isSubmitting
                      ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-white border-indigo-200 text-slate-800 hover:bg-indigo-50"
                  }`}
                >
                  Continue with Google (Student)
                </button>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-slate-900">Instructor sign-in</div>
                      <div className="text-xs text-slate-600 mt-1">
                        For authorized instructors only
                      </div>
                    </div>
                    <div className="text-xs text-indigo-700">Instructor</div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setErrorMessage(null);
                        setInfoMessage(null);
                        setIsSubmitting(true);
                        await continueWithGoogleInstructor();
                        // Auth state change will trigger auto-redirect
                      } catch (e) {
                        setErrorMessage(toFriendlyAuthError(e, "Instructor sign-in failed"));
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    disabled={isSubmitting}
                    className={`mt-3 w-full px-6 py-3 rounded-2xl border transition-all ${
                      isSubmitting
                        ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-white border-indigo-200 text-slate-800 hover:bg-indigo-50"
                    }`}
                  >
                    Continue with Google (Instructor)
                  </button>

                  <div className="mt-3 text-xs text-slate-600">
                    Instructor email/password sign-in is available below.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 my-6">
                <div className="h-px flex-1 bg-indigo-100" />
                <div className="text-xs text-slate-500">OR</div>
                <div className="h-px flex-1 bg-indigo-100" />
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-indigo-50 border border-indigo-100 mb-6">
                <button
                  type="button"
                  onClick={() => setTab("sign-in")}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    tab === "sign-in"
                      ? "bg-white shadow-sm text-indigo-700"
                      : "text-slate-600 hover:text-indigo-700"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    tab === "register"
                      ? "bg-white shadow-sm text-indigo-700"
                      : "text-slate-600 hover:text-indigo-700"
                  }`}
                >
                  Register
                </button>
              </div>

              {tab === "sign-in" ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      setErrorMessage(null);
                      setInfoMessage(null);
                      setIsSubmitting(true);
                      
                      // Check if this looks like an instructor email
                      const email = signIn.username.trim().toLowerCase();
                      if (email === NANDINI.email.toLowerCase()) {
                        // Use instructor sign-in
                        await signInWithEmailInstructor(signIn.username, signIn.password);
                      } else {
                        // Use regular student sign-in
                        await signInWithEmail(signIn.username, signIn.password);
                      }
                      // Auth state change will trigger auto-redirect
                    } catch (err) {
                      setErrorMessage(toFriendlyAuthError(err, "Sign in failed"));
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Email</label>
                    <input
                      value={signIn.username}
                      onChange={(e) => setSignIn((s) => ({ ...s, username: e.target.value }))}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Password</label>
                    <input
                      value={signIn.password}
                      onChange={(e) => setSignIn((s) => ({ ...s, password: e.target.value }))}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      type="password"
                      autoComplete="current-password"
                      required
                    />

                        {/* Forgot password (make sure it's always visible) */}
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setErrorMessage(null);
                                setInfoMessage(null);
                                setIsSubmitting(true);
                                await sendPasswordReset(signIn.username);
                                setInfoMessage("Password reset email sent. Please check your inbox.");
                              } catch (err) {
                                setErrorMessage(
                                  err instanceof Error ? err.message : "Password reset failed"
                                );
                              } finally {
                                setIsSubmitting(false);
                              }
                            }}
                            disabled={isSubmitting}
                            className="text-sm text-indigo-700 hover:text-indigo-800 hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 rounded-2xl transition-all ${
                      isSubmitting
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30"
                    }`}
                  >
                    Sign In
                  </button>

                </form>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (register.password !== register.confirmPassword) return;

                    try {
                      setErrorMessage(null);
                      setInfoMessage(null);
                      setIsSubmitting(true);
                      await registerWithEmail({
                        fullName: register.fullName,
                        email: register.email,
                        phone: register.phone,
                        password: register.password,
                      });
                      setInfoMessage(
                        "Account created successfully! Redirecting..."
                      );
                      // Auth state change will trigger auto-redirect
                    } catch (err) {
                      setErrorMessage(toFriendlyAuthError(err, "Registration failed"));
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Full name</label>
                    <input
                      value={register.fullName}
                      onChange={(e) =>
                        setRegister((s) => ({ ...s, fullName: e.target.value }))
                      }
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Email</label>
                    <input
                      value={register.email}
                      onChange={(e) => setRegister((s) => ({ ...s, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Phone</label>
                    <input
                      value={register.phone}
                      onChange={(e) => setRegister((s) => ({ ...s, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Password</label>
                    <input
                      value={register.password}
                      onChange={(e) =>
                        setRegister((s) => ({ ...s, password: e.target.value }))
                      }
                      placeholder="Create a password"
                      className="w-full px-4 py-3 rounded-2xl bg-white/70 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Confirm password</label>
                    <input
                      value={register.confirmPassword}
                      onChange={(e) =>
                        setRegister((s) => ({ ...s, confirmPassword: e.target.value }))
                      }
                      placeholder="Re-enter your password"
                      className={`w-full px-4 py-3 rounded-2xl bg-white/70 border focus:outline-none focus:ring-2 ${
                        registerPasswordMismatch
                          ? "border-red-300 focus:ring-red-200"
                          : "border-indigo-200 focus:ring-indigo-300"
                      }`}
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                    {registerPasswordMismatch && (
                      <div className="mt-2 text-sm text-red-600">
                        Passwords do not match
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={registerPasswordMismatch || isSubmitting}
                    className={`w-full px-6 py-3 rounded-2xl transition-all ${
                      registerPasswordMismatch || isSubmitting
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30"
                    }`}
                  >
                    Register
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
      </main>
    </div>
  );
}
