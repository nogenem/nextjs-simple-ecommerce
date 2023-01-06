import { type NextPage } from 'next';
import Head from 'next/head';

import { Box, Flex, Text } from '@chakra-ui/react';

import { HomeFiltersContainer } from '~/features/filters/components';
import { useFiltersSync } from '~/features/filters/hooks';
import { ProductCard } from '~/features/products/components';
import { useHomeProducts } from '~/features/products/hooks';

const Home: NextPage = () => {
  const { products, areTheHomeProductsLoading } = useHomeProducts();

  useFiltersSync();

  return (
    <>
      <Head>
        <title>Simple ECommerce</title>
        <meta name="description" content="A simple ECommerce example" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex direction={{ base: 'column', md: 'row' }} w="100%">
        <HomeFiltersContainer />
        <Flex
          w="100%"
          wrap="wrap"
          grow="1"
          justify={{ base: 'center', md: 'flex-start' }}
          gap="3"
        >
          {areTheHomeProductsLoading && (
            <Box w="100%">
              <Text fontSize="xl">Loading...</Text>
            </Box>
          )}
          {!areTheHomeProductsLoading && products.length === 0 && (
            <Box w="100%">
              <Text fontSize="xl">No product found</Text>
            </Box>
          )}
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Flex>
      </Flex>
    </>
  );
};

export default Home;
