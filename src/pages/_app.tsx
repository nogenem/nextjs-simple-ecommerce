import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { type AppType } from 'next/app';

import { ChakraProvider } from '@chakra-ui/react';

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
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <ChakraProvider theme={theme}>
      <SessionProvider session={session}>
        {getLayout(<Component {...pageProps} />)}
      </SessionProvider>
    </ChakraProvider>
  );
};

export default trpc.withTRPC(MyApp);
