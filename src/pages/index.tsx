import { type NextPage } from 'next';
import Head from 'next/head';

import { Flex, Show, Text } from '@chakra-ui/react';

import {
  HomeFiltersContainer,
  SearchFilter,
  SortFilter,
} from '~/features/filters/components';
import { useFiltersSync } from '~/features/filters/hooks';
import { ProductCard } from '~/features/products/components';
import { useHomeProducts } from '~/features/products/hooks';
import { useHandleStripeQueryKeys } from '~/features/stripe/hooks';
import { CenteredAlert, CenteredLoadingIndicator } from '~/shared/components';

const HomePage: NextPage = () => {
  const { products, areTheHomeProductsLoading } = useHomeProducts();

  useFiltersSync();
  useHandleStripeQueryKeys();

  return (
    <>
      <PageHead />
      <Flex direction={{ base: 'column', md: 'row' }} w="100%">
        <HomeFiltersContainer />
        <Flex flexDir="column" w="100%">
          <HeaderFilters productsLen={products.length} />
          <Flex
            w="100%"
            wrap="wrap"
            grow="1"
            justify={{ base: 'center', md: 'flex-start' }}
            gap="3"
          >
            {areTheHomeProductsLoading && <CenteredLoadingIndicator />}
            {!areTheHomeProductsLoading && products.length === 0 && (
              <CenteredAlert status="info">No product found</CenteredAlert>
            )}
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
};

const PageHead = () => {
  const title = 'Home page | ECommerce';
  const description = 'Buy a diverse quantity of products on ECommerce.';
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

const HeaderFilters = ({ productsLen }: { productsLen: number }) => {
  return (
    <>
      <Show above="lg">
        <Flex mb="3" gap="3" justifyContent="space-between" alignItems="center">
          <Text whiteSpace="nowrap">{productsLen} products</Text>
          <SearchFilter />
          <SortFilter />
        </Flex>
      </Show>
      <Show below="lg">
        <Flex
          mb="3"
          gap="3"
          justifyContent="center"
          alignItems="center"
          direction="column"
        >
          <SearchFilter />
          <Flex
            w="100%"
            justifyContent="space-between"
            alignItems="center"
            gap="3"
          >
            <Text whiteSpace="nowrap">{productsLen} products</Text>
            <SortFilter />
          </Flex>
        </Flex>
      </Show>
    </>
  );
};

export default HomePage;
