import { useRouter } from 'next/router';

import { Box } from '@chakra-ui/react';

import { useProtectedRoute } from '~/features/auth/hooks';

const Order = () => {
  const router = useRouter();

  useProtectedRoute();

  return <Box w="100%">Order ID: {router.query.id}</Box>;
};

export default Order;
