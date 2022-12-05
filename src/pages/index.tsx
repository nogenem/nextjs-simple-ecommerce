import { type NextPage } from 'next';
import Head from 'next/head';

import { Box } from '@chakra-ui/react';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Simple ECommerce</title>
        <meta name="description" content="A simple ECommerce example" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box w="100%">Home</Box>
    </>
  );
};

export default Home;
