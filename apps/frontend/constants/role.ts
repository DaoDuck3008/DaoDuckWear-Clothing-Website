export const ROLE_MAP = {
  STAFF: "Nhân viên",
  MANAGER: "Quản lý",
  ADMIN: "Quản trị viên",
} as const;

export type RoleKey = keyof typeof ROLE_MAP;
