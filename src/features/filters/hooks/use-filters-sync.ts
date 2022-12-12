import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { useFiltersActions } from './use-filters-store';

export const useFiltersSync = () => {
  const router = useRouter();
  const { setFilters } = useFiltersActions();

  useEffect(() => {
    if (router.isReady) {
      setFilters(router.query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Removes everything till the first '?'
      const searchParams = url.substring(url.indexOf('?'), url.length);
      const params = Object.fromEntries(new URLSearchParams(searchParams));

      setFilters(params);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, setFilters]);
};
