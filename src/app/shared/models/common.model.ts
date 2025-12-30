// Modelos comunes para paginación y respuestas del API

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
