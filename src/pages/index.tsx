import { type NextPage } from 'next';
import Head from 'next/head';

import { Box, Flex } from '@chakra-ui/react';

import { HomeFiltersContainer } from '~/features/products/components';
import { ProductCard } from '~/features/products/components/product-card';
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
            <Flex
              w="100%"
              wrap="wrap"
              grow="1"
              justify={{ base: 'center', md: 'flex-start' }}
              gap="3"
            >
              {products.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </Flex>
          </>
        )}
      </Flex>
    </>
  );
};

export default Home;
