import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { PronunciationPractice } from "./components/PronunciationPractice";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { useAuth } from "./context/AuthContext";
import { normalizeRedirect } from "./lib/roles";
import { clearDeepLinkFromUrl, parseDeepLinkFromLocation } from "./lib/urlState";

type Page =
  | "landing"
  | "auth"
  | "student-dashboard"
  | "pronunciation"
  | "teacher-dashboard";

function pageFromHash(hash: string): Page | null {
  const raw = (hash || "").trim();
  if (!raw) return null;

  const cleaned = raw.startsWith("#") ? raw.slice(1) : raw;
  const withoutLeadingSlash = cleaned.startsWith("/") ? cleaned.slice(1) : cleaned;
  const value = withoutLeadingSlash as Page;

  const allowed: readonly Page[] = [
    "landing",
    "auth",
    "student-dashboard",
    "teacher-dashboard",
    "pronunciation",
  ];
  return allowed.includes(value) ? value : null;
}

function hashForPage(page: Page): string {
  return `#/${page}`;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [authRedirectTo, setAuthRedirectTo] = useState<Page>("student-dashboard");
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);
  const { user, role, loading, profileLoading } = useAuth();

  const protectedPages: readonly Page[] = [
    "student-dashboard",
    "teacher-dashboard",
  ];

  const setPage = (
    next: Page,
    options?: { replace?: boolean }
  ) => {
    setCurrentPage(next);

    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      url.hash = hashForPage(next);

      if (options?.replace) {
        window.history.replaceState({ page: next }, "", url.toString());
      } else {
        window.history.pushState({ page: next }, "", url.toString());
      }
    } catch {
      // ignore
    }
  };

  const onNavigate = (page: string, options?: { allowUnauthed?: boolean; replace?: boolean }) => {
    const next = page as Page;

    if (user) {
      const normalized = normalizeRedirect(role, next);

      if (normalized !== next) {
        setPage(normalized as Page, { replace: true });
        return;
      }
    }

    if (protectedPages.includes(next)) {
      if (!user && !options?.allowUnauthed) {
        setAuthRedirectTo(next);
        setPage("auth", { replace: !!options?.replace });
        return;
      }
    }

    setPage(next, { replace: !!options?.replace });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handlePop = () => {
      const p = pageFromHash(window.location.hash);
      if (p) {
        // Validate access to protected pages on back navigation
        if (protectedPages.includes(p)) {
          if (!user) {
            // User not logged in, redirect to auth
            setAuthRedirectTo(p);
            setCurrentPage('auth');
            return;
          }
        }
        setCurrentPage(p);
      }
    };

    window.addEventListener("popstate", handlePop);
    window.addEventListener("hashchange", handlePop);
    return () => {
      window.removeEventListener("popstate", handlePop);
      window.removeEventListener("hashchange", handlePop);
    };
  }, [user, protectedPages]);

  useEffect(() => {
    if (deepLinkHandled) return;
    if (loading || profileLoading) return;
    if (typeof window === "undefined") return;

    const dl = parseDeepLinkFromLocation(window.location);
    if (dl.page === "none") {
      // If there is no deep link, attempt to restore the page from the URL hash.
      const fromHash = pageFromHash(window.location.hash);
      if (fromHash) {
        // Validate that the user can access this page
        if (protectedPages.includes(fromHash)) {
          if (!user) {
            // User not logged in, redirect to auth
            setCurrentPage('auth');
            setAuthRedirectTo(fromHash);
          } else {
            // User is logged in, allow access
            setCurrentPage(fromHash);
          }
        } else {
          setCurrentPage(fromHash);
        }
      } else if (user) {
        // No hash but user is logged in - go to their dashboard
        const defaultPage: Page = role === 'teacher' || role === 'admin' ? 'teacher-dashboard' : 'student-dashboard';
        setCurrentPage(defaultPage);
        try {
          const url = new URL(window.location.href);
          url.hash = hashForPage(defaultPage);
          window.history.replaceState({ page: defaultPage }, "", url.toString());
        } catch {
          // ignore
        }
      } else {
        // No hash and no user - stay on landing
        try {
          const url = new URL(window.location.href);
          url.hash = hashForPage(currentPage);
          window.history.replaceState({ page: currentPage }, "", url.toString());
        } catch {
          // ignore
        }
      }
      setDeepLinkHandled(true);
      return;
    }
    // No longer supporting deep links to live classes.
    clearDeepLinkFromUrl();
    setDeepLinkHandled(true);
  }, [deepLinkHandled, loading, profileLoading, user, role, currentPage, protectedPages]);

  // Handle navigation to auth/landing when already authenticated
  // This runs AFTER initial setup is complete
  useEffect(() => {
    // Skip during initial load
    if (!deepLinkHandled || loading || profileLoading) return;
    
    // If authenticated user navigates to auth or landing, redirect to their dashboard
    if (user && (currentPage === 'auth' || currentPage === 'landing')) {
      const defaultPage: Page = role === 'teacher' || role === 'admin' ? 'teacher-dashboard' : 'student-dashboard';
      console.log('🔄 Authenticated user on auth/landing, redirecting:', { 
        user: user.email, 
        role,
        from: currentPage,
        to: defaultPage 
      });
      setPage(defaultPage, { replace: true });
    }
  }, [user, role, currentPage, deepLinkHandled, loading, profileLoading]);

  const renderPage = () => {
    // If we're loading and on a protected page, show loading screen
    if ((loading || profileLoading) && protectedPages.includes(currentPage)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="p-6 rounded-2xl bg-card border border-border text-sm">
            Loading…
          </div>
        </div>
      );
    }

    // Only redirect to auth if not loading AND user doesn't exist
    if (protectedPages.includes(currentPage) && !user && !loading && !profileLoading) {
      return <AuthPage onNavigate={onNavigate} redirectTo={authRedirectTo} />;
    }

    switch (currentPage) {
      case "landing":
        return <LandingPage onNavigate={onNavigate} />;
      case "auth":
        return <AuthPage onNavigate={onNavigate} redirectTo={authRedirectTo} />;
      case "student-dashboard":
        return <StudentDashboard onNavigate={onNavigate} />;
      case "pronunciation":
        return <PronunciationPractice onNavigate={onNavigate} />;
      case "teacher-dashboard":
        return <TeacherDashboard onNavigate={onNavigate} />;
      default:
        return <LandingPage onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
