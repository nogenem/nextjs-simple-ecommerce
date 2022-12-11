import '@fontsource/roboto';

import { useEffect } from 'react';

import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { type AppType } from 'next/app';
import { useRouter } from 'next/router';

import { ChakraProvider } from '@chakra-ui/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { useFiltersActions } from '~/features/filters/hooks/use-filters-store';
import { DefaultLayout } from '~/shared/components';
import { theme } from '~/shared/theme';
import type { NextPageWithLayout } from '~/shared/types/globals';
import { trpc } from '~/shared/utils/trpc';

import '~/shared/styles/globals.css';

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const { isReady, query } = useRouter();
  const { setFilters } = useFiltersActions();

  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  useEffect(() => {
    if (isReady) {
      setFilters(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return (
    <ChakraProvider theme={theme}>
      <SessionProvider session={session}>
        {getLayout(<Component {...pageProps} />)}
        <ReactQueryDevtools initialIsOpen={false} />
      </SessionProvider>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
