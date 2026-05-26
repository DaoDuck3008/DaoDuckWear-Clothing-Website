export interface ReviewUser {
  id: string;
  username: string;
  avatar?: string;
}

export interface Review {
  _id: string;
  id: string;
  userId: ReviewUser;
  productId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}
