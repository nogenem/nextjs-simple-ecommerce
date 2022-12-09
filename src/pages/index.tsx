import { type NextPage } from 'next';
import Head from 'next/head';

import { Box, Flex } from '@chakra-ui/react';

import { HomeFiltersContainer } from '~/features/products/components';
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
      <Flex direction={{ base: 'column', md: 'row' }} w="100%">
        {products.isLoading && <Box w="100%">Loading...</Box>}
        {products.isSuccess && (
          <>
            <HomeFiltersContainer />
            <Flex wrap="wrap" grow="1" w="100%">
              Products
            </Flex>
          </>
        )}
      </Flex>
    </>
  );
};

export default Home;
