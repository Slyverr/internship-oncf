import axios, { AxiosRequestConfig } from 'axios';

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/proxy`,
  withCredentials: true,
});

export const customFetch = async <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const isServer = typeof window === 'undefined';
  const cookie = isServer ? (await (await import('next/headers')).cookies()).toString() : undefined;

  const { data } = await client({
    ...config,
    ...options,
    headers: { ...config.headers, ...options?.headers, ...(cookie && { Cookie: cookie }) },
  });

  return data;
};

export default customFetch;
