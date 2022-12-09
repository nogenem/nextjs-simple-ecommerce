import { type NextPage } from 'next';
import Head from 'next/head';

import { Box } from '@chakra-ui/react';

import { useHomeProducts } from '~/features/products/hooks';

const Home: NextPage = () => {
  const products = useHomeProducts();

  return (
    <>
      <Head>
        <title>Simple ECommerce</title>
        <meta name="description" content="A simple ECommerce example" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box w="100%">
        {products.isLoading && <Box w="100%">Loading...</Box>}
        {products.isSuccess && (
          <pre>{JSON.stringify(products.data, null, 2)}</pre>
        )}
      </Box>
    </>
  );
};

export default Home;
