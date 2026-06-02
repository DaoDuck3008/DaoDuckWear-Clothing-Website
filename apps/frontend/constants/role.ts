export const ROLE_MAP = {
  STAFF: "Nhân viên",
  MANAGER: "Quản lý",
  ADMIN: "Quản trị viên",
  RECEPTIONIST: "Lễ tân",
} as const;

export type RoleKey = keyof typeof ROLE_MAP;

// Tất cả role thuộc cửa hàng (không hiện chat popup)
export const SHOP_ROLES = Object.keys(ROLE_MAP) as RoleKey[];

export function isShopRole(role?: string | null): boolean {
  return !!role && (SHOP_ROLES as string[]).includes(role);
}

// Role phía cửa hàng được phép tham gia chat với khách
export const CHAT_STAFF_ROLES = ["MANAGER", "RECEPTIONIST"] as const;

export function isChatStaffRole(role?: string | null): boolean {
  return !!role && (CHAT_STAFF_ROLES as readonly string[]).includes(role);
}
