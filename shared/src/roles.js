export const USER_ROLES = [
    "STUDENT",
    "MENTOR",
    "ADMIN",
    "CONTENT_MANAGER",
    "SUPER_ADMIN",
];
export const ROLE_HIERARCHY = {
    STUDENT: 1,
    MENTOR: 2,
    CONTENT_MANAGER: 3,
    ADMIN: 4,
    SUPER_ADMIN: 5,
};
export function isUserRole(value) {
    return USER_ROLES.includes(value);
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
};
