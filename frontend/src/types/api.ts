export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}
