import { useEffect } from 'react';

import { signIn, useSession } from 'next-auth/react';

export const useProtectedRoute = () => {
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      signIn('google');
    }
  }, [sessionStatus]);
};
