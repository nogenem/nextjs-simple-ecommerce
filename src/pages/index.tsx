import { type NextPage } from 'next';
import Head from 'next/head';

import { Box } from '@chakra-ui/react';

import { trpc } from '~/shared/utils/trpc';

const Home: NextPage = () => {
  const hello = trpc.example.hello.useQuery({ text: 'from tRPC' });

  return (
    <>
      <Head>
        <title>Simple ECommerce</title>
        <meta name="description" content="A simple ECommerce example" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box w="100%">Home - {hello.data?.greeting}</Box>
    </>
  );
};

export default Home;
