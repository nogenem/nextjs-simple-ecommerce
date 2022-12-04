import { type NextPage } from 'next';
import { signIn, signOut, useSession } from 'next-auth/react';
import Head from 'next/head';

import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';

const Home: NextPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Simple ECommerce</title>
        <meta name="description" content="A simple ECommerce example" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Box w="100%" p={4}>
          <Tooltip label="toggle dark/light mode">
            <IconButton
              onClick={toggleColorMode}
              aria-label="toggle dark/light mode"
              icon={
                colorMode === 'light' ? (
                  <MoonIcon fontSize="1.25rem" />
                ) : (
                  <SunIcon fontSize="1.25rem" />
                )
              }
              border="1px solid"
              borderColor={`mode.${colorMode}.text`}
            />
          </Tooltip>
          <Box pt={4}>
            {session && session.user && (
              <>
                Signed in as {session.user.name} <br />
                <Button onClick={() => signOut()}>Sign out</Button>
              </>
            )}
            {!session && (
              <>
                Not signed in <br />
                <Button onClick={() => signIn('google')}>Sign in</Button>
              </>
            )}
          </Box>
        </Box>
      </main>
    </>
  );
};

export default Home;
