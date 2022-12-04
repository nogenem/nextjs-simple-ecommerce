import { type NextPage } from 'next';
import Head from 'next/head';

import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { Box, IconButton, Tooltip, useColorMode } from '@chakra-ui/react';

const Home: NextPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();

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
        </Box>
      </main>
    </>
  );
};

export default Home;
