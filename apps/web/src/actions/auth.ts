import { cache } from 'react';
import { authControllerGetProfile } from '@/lib/api/generated';

export const getCurrentUser = cache(async () => {
  try {
    return await authControllerGetProfile();
  }catch (_) {
    return null;
  }
});
