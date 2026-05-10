// apps/backend/src/common/interfaces/response.interface.ts

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiMeta {
  requestId: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
}
