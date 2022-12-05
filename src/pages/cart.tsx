import { type NextPage } from 'next';
import Head from 'next/head';

import { Box } from '@chakra-ui/react';

const Cart: NextPage = () => {
  return (
    <>
      <Head>
        <title>Simple ECommerce - Cart</title>
        <meta
          name="description"
          content="The cart page of this simple ecommerce"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box w="100%">Cart</Box>
    </>
  );
};

export default Cart;
