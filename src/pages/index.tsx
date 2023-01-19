import type { GetServerSidePropsContext } from 'next';
import { type NextPage } from 'next';
import Head from 'next/head';

import { Flex, Show, Text } from '@chakra-ui/react';
import { AttributeType } from '@prisma/client';
import { createProxySSGHelpers } from '@trpc/react-query/ssg';
import superjson from 'superjson';

import {
  HomeFiltersContainer,
  SearchFilter,
  SortFilter,
} from '~/features/filters/components';
import { useFiltersSync } from '~/features/filters/hooks';
import { getOnlyValidFilters } from '~/features/filters/utils/get-only-valid-filters';
import { ProductCard } from '~/features/products/components';
import { useHomeProducts } from '~/features/products/hooks';
import { useHandleStripeQueryKeys } from '~/features/stripe/hooks';
import { createContextInner } from '~/server/trpc/context';
import { appRouter } from '~/server/trpc/router';
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

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session: null }),
    transformer: superjson,
  });

  await Promise.all([
    ssg.attributes.byType.prefetch({ type: AttributeType.Size }),
    ssg.attributes.byType.prefetch({ type: AttributeType.Color }),
    ssg.categories.all.prefetch(),
    ssg.products.home.prefetch(getOnlyValidFilters(ctx.query)),
    ssg.cart.sumItemsQuantities.prefetch(),
  ]);

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
}

export default HomePage;
