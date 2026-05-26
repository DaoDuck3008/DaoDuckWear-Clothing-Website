export interface ApiError {
  success: false;
  statusCode: number;
  errorCode: string;
  message: string;
  errors: string[] | null;
  timestamp: string;
  path: string;
  method: string;
  stack?: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
