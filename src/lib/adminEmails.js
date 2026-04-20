export const APPROVED_ADMIN_EMAILS = [
  "mobashirhossian08@gmail.com",
  "abdmt671@gmail.com",
];

export function normalizeEmail(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function isApprovedAdminEmail(email = "") {
  return APPROVED_ADMIN_EMAILS.includes(normalizeEmail(email));
}
