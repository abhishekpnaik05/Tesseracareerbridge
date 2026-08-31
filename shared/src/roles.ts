export const USER_ROLES = [
  "STUDENT",
  "MENTOR",
  "ADMIN",
  "CONTENT_MANAGER",
  "SUPER_ADMIN",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  STUDENT: 1,
  MENTOR: 2,
  CONTENT_MANAGER: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export const ROLE_PERMISSIONS = {
  STUDENT: [
    "student:self:read",
    "student:self:write",
    "learning:enrolled:read",
    "submissions:own:write",
  ],
  MENTOR: [
    "mentor:assigned:read",
    "mentor:assigned:write",
    "evaluations:assigned:write",
    "doubts:assigned:write",
  ],
  CONTENT_MANAGER: [
    "curriculum:write",
    "content:write",
    "programs:read",
  ],
  ADMIN: [
    "admin:users:read",
    "admin:programs:write",
    "admin:batches:write",
    "admin:analytics:read",
    "admin:certificates:write",
  ],
  SUPER_ADMIN: ["*"],
} as const;

export type Permission =
  | (typeof ROLE_PERMISSIONS)[UserRole][number]
  | "*";
