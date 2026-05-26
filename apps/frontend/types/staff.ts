export type StaffRole = "ADMIN" | "MANAGER" | "STAFF";

export type StaffGender = "male" | "female" | "other";
export type StaffEmploymentStatus = "active" | "onLeave" | "terminated";

export interface StaffShop {
  id: string;
  name: string;
}

export interface StaffRoleRef {
  id: string;
  name: StaffRole;
}

export interface Staff {
  id: string;
  username: string;
  email: string;
  role: StaffRoleRef | null;
  shop: StaffShop | null;
  fullName: string | null;
  dateOfBirth: string | null;
  gender: StaffGender | null;
  nationalId: string | null;
  phone: string | null;
  hometown: string | null;
  permanentAddress: string | null;
  currentAddress: string | null;
  hireDate: string | null;
  employmentStatus: StaffEmploymentStatus | null;
  position: string | null;
  provider: "local" | "google" | "facebook";
  isVerified: boolean;
  avatar: string | null;
  createdAt: string;
}

export interface StaffListResponse {
  data: Staff[];
  total: number;
  page: number;
  limit: number;
}

export interface StaffListParams {
  search?: string;
  role?: StaffRole;
  shopId?: string;
  page?: number;
  limit?: number;
}

export interface StaffProfilePayload {
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: StaffGender | null;
  nationalId?: string | null;
  phone?: string | null;
  hometown?: string | null;
  permanentAddress?: string | null;
  currentAddress?: string | null;
  hireDate?: string | null;
  employmentStatus?: StaffEmploymentStatus | null;
  position?: string | null;
}

export interface CreateStaffPayload extends StaffProfilePayload {
  username: string;
  email: string;
  role: StaffRole;
  shopId?: string;
}

export interface UpdateStaffPayload extends StaffProfilePayload {
  username?: string;
  role?: StaffRole;
  shopId?: string | null;
}
