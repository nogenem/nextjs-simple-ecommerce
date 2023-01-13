import type { NextPage } from 'next';
import Head from 'next/head';

import { Flex, Heading, useColorModeValue } from '@chakra-ui/react';

import { useProtectedRoute } from '~/features/auth/hooks';
import { OrdersTable } from '~/features/orders/components';
import { useOrdersForTable } from '~/features/orders/hooks';

const Orders: NextPage = () => {
  const primaryColor = useColorModeValue('primary.500', 'primary.300');

  const { orders, areTheOrdersLoading } = useOrdersForTable();

  useProtectedRoute();

  return (
    <>
      <PageHead />
      <Flex
        w="100%"
        maxW="65rem"
        margin="auto"
        flexDir="column"
        alignItems="center"
        justifyContent="center"
      >
        <Heading mb="3" color={primaryColor}>
          Your orders
        </Heading>

        <OrdersTable orders={orders} isLoading={areTheOrdersLoading} />
      </Flex>
    </>
  );
};

const PageHead = () => {
  const title = 'Orders page | ECommerce';
  const description = 'View all your orders on ECommerce.';
  return (
    <Head>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default Orders;
