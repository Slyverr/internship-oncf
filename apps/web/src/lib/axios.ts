import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { cookies } from 'next/headers';

export const customInstance = async <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  const instance = axios.create({
    baseURL: process.env.BACKEND_API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return instance({ ...config, ...options }).then((res) => res.data);
};

export default customInstance;

export type ErrorType<Error> = AxiosError<Error>;
