import { useRouter } from 'next/router';

import { useToast } from '@chakra-ui/react';

import { trpc } from '~/shared/utils/trpc';

export const usePlaceOrder = () => {
  const toast = useToast();
  const router = useRouter();
  const utils = trpc.useContext();

  const mutation = trpc.orders.placeOrder.useMutation({
    onSuccess: (data) => {
      utils.orders.invalidate();
      utils.cart.invalidate();

      router.push(`/order/${data.id}`);
    },
    onError: () => {
      toast({
        title: 'Unable to place the order.',
        description: 'Please, try again later',
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    },
  });

  return {
    placeOrder: mutation.mutate,
    isPlacingTheOrder: mutation.isLoading,
  };
};
