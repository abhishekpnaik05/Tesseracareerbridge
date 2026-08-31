import type { UserRole } from "@tesseracareerbridge/shared";

export function homePathForRole(role: UserRole): string {
  if (role === "STUDENT") return "/student";
  if (role === "MENTOR") return "/mentor";
  return "/admin";
}
