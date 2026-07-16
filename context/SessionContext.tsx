import { useRouter } from 'expo-router';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Alert } from 'react-native';

import { registerTokenHandlers } from '@/services/api/client';
import { clearSession, loadSession, saveSession, updateAccessToken, updateStoredUser } from '@/services/tokenStorage';
import type { UserRole } from '@/types';

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
  // Only ever populated for role: 'driver' (MotoristasAdmin on the backend).
  placaVan?: string | null;
  modeloVan?: string | null;
}

interface SessionContextValue {
  user: SessionUser | null;
  // True while the persisted session is being restored from SecureStore on
  // app start. Screens that redirect based on `user` should wait for this
  // to go false first (see app/index.tsx) to avoid a role-selection flash.
  isLoading: boolean;
  login: (user: SessionUser) => void;
  updateUser: (patch: Partial<Omit<SessionUser, 'role'>>) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function toStoredUser(user: SessionUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    placaVan: user.placaVan,
    modeloVan: user.modeloVan,
  };
}

// Sessão persistida via expo-secure-store: os tokens JWT (access + refresh)
// e um retrato mínimo do usuário ficam em armazenamento criptografado do
// SO (Keychain/Keystore), sobrevivendo ao fechamento do app. A senha em si
// nunca é armazenada — nem aqui nem em nenhum outro lugar do app.
export function SessionProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kept in sync with `user` on every render so the token-handler callbacks
  // registered below (which close over this ref, not state) always read the
  // latest tokens without needing to re-register on every login/refresh.
  const userRef = useRef<SessionUser | null>(null);
  userRef.current = user;

  useEffect(() => {
    let isMounted = true;
    loadSession().then((stored) => {
      if (!isMounted) return;
      if (stored) {
        setUser({
          id: stored.user.id,
          name: stored.user.name,
          email: stored.user.email,
          role: stored.user.role,
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken,
          placaVan: stored.user.placaVan,
          modeloVan: stored.user.modeloVan,
        });
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback((nextUser: SessionUser) => {
    setUser(nextUser);
    void saveSession(toStoredUser(nextUser), nextUser.accessToken, nextUser.refreshToken);
  }, []);

  const updateUser = useCallback((patch: Partial<Omit<SessionUser, 'role'>>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      void updateStoredUser(toStoredUser(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    void clearSession();
  }, []);

  // Registered once; reads current tokens via userRef so it never goes
  // stale. See services/api/client.ts for how these are used.
  useEffect(() => {
    registerTokenHandlers({
      getAccessToken: () => userRef.current?.accessToken ?? null,
      getRefreshToken: () => userRef.current?.refreshToken ?? null,
      onTokensRefreshed: ({ accessToken }) => {
        setUser((prev) => (prev ? { ...prev, accessToken } : prev));
        void updateAccessToken(accessToken);
      },
      onSessionExpired: () => {
        setUser(null);
        void clearSession();
        Alert.alert('Sessão expirada', 'Faça login novamente para continuar.');
        router.replace('/');
      },
    });
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, login, updateUser, logout }),
    [user, isLoading, login, updateUser, logout]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession deve ser usado dentro de um SessionProvider.');
  }
  return context;
}
