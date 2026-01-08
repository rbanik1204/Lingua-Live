import { NANDINI } from "../data/nandini";

export type AppRole = "student" | "teacher" | "admin";

const INSTRUCTOR_EMAILS = [
  NANDINI.email,
  "lingualive.nandini@gmail.com", // Alternative instructor email
].map((e) => e.trim().toLowerCase());

export function isTeacherEmail(email?: string | null): boolean {
  if (!email) return false;
  return INSTRUCTOR_EMAILS.includes(email.trim().toLowerCase());
}

export function getDefaultRoleForEmail(email?: string | null): AppRole {
  // Default rule: single teacher account (Nandini). Admin can be granted manually in Firestore.
  return isTeacherEmail(email) ? "teacher" : "student";
}

export function getDefaultPageForRole(role: AppRole): string {
  return role === "teacher" || role === "admin" ? "teacher-dashboard" : "student-dashboard";
}

export function canAccessPage(role: AppRole, page: string): boolean {
  if (role === "admin") return true;
  if (role === "teacher") return true;

  // Student cannot access teacher dashboard
  return page !== "teacher-dashboard";
}

export function normalizeRedirect(role: AppRole, desiredPage: string): string {
  return canAccessPage(role, desiredPage) ? desiredPage : getDefaultPageForRole(role);
}
