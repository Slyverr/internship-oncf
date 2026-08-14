'use client';

import { createContext, ReactNode, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ user, children }: { user: any; children: ReactNode }) {
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}

export function useAuth(): any {
  const user = useContext(AuthContext);
  if (!user) {
    throw new Error('useAuth must be used within (protected) routes');
  }
  return user;
}
