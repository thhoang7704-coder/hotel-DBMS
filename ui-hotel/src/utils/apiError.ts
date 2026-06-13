import axios, { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message?: string;
  code?: string;
  status?: number;
}

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};
