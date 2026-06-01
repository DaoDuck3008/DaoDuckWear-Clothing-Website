export const ROLE_MAP = {
  STAFF: "Nhân viên",
  MANAGER: "Quản lý",
  ADMIN: "Quản trị viên",
  RECEPTIONIST: "Lễ tân",
} as const;

export type RoleKey = keyof typeof ROLE_MAP;

// Role phía cửa hàng được phép tham gia chat với khách
export const CHAT_STAFF_ROLES = ["MANAGER", "RECEPTIONIST"] as const;

export function isChatStaffRole(role?: string | null): boolean {
  return !!role && (CHAT_STAFF_ROLES as readonly string[]).includes(role);
}
