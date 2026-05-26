export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role: string;
  phone?: string;
  shopId?: string;
  shop?: {
    _id: string;
    name: string;
  } | null;
}
