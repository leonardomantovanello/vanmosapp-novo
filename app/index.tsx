import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { Screen } from '@/components/ui/Screen';
import { useSession } from '@/context/SessionContext';

// No role picker here anymore — there's a single login screen (app/login.tsx)
// and the backend decides driver vs passenger from Passageiro.tipo (see
// authService.ts). This route is just the session gate: send restored
// sessions straight to their home, everyone else to /login.
export default function Index() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isLoading) return;
    router.replace(session.user ? (session.user.role === 'driver' ? '/driver-home' : '/passenger-home') : '/login');
  }, [session.isLoading, session.user, router]);

  return <Screen contentContainerStyle={{ flex: 1 }}>{null}</Screen>;
}
