import { cache } from 'react';
import { authControllerGetProfile } from '@/lib/api/auth';

export const getCurrentUser = cache(async () => {
  try {
    return await authControllerGetProfile();
  }catch (_) {
    return null;
  }
});
