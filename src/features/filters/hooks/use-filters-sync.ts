import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { useFilters, useFiltersActions } from './use-filters-store';

export const useFiltersSync = () => {
  const router = useRouter();
  const { setFilters } = useFiltersActions();
  const { areTheFiltersInitialized } = useFilters();

  if (!areTheFiltersInitialized) {
    setFilters(router.query);
  }

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
