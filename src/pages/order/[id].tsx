import { useRouter } from 'next/router';

import {
  Alert,
  AlertIcon,
  CircularProgress,
  Flex,
  Stack,
} from '@chakra-ui/react';

import { useProtectedRoute } from '~/features/auth/hooks';
import { useOrderById } from '~/features/orders/hooks';

const Order = () => {
  const router = useRouter();
  const orderId = Array.isArray(router.query.id)
    ? router.query.id[0]
    : router.query.id;

  const { order, isLoading: isOrderLoading } = useOrderById(orderId);

  useProtectedRoute();

  if (isOrderLoading) {
    return (
      <Flex w="100%" alignItems="center" justifyContent="center">
        <CircularProgress isIndeterminate color="primary.300" />
      </Flex>
    );
  }

  if (!order) {
    return (
      <Flex w="100%" alignItems="center" justifyContent="center">
        <Alert status="error">
          <AlertIcon />
          Order not found
        </Alert>
      </Flex>
    );
  }

  return (
    <Stack w="100%">
      <pre>{JSON.stringify(order, null, 2)}</pre>
    </Stack>
  );
};

export default Order;
