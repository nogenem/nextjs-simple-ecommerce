import { useToast } from '@chakra-ui/react';

import { trpc } from '~/shared/utils/trpc';

export const useFulfillPaypalOrder = () => {
  const toast = useToast();
  const utils = trpc.useContext();

  const mutation = trpc.paypal.fulfillOrder.useMutation({
    onSuccess: () => {
      utils.orders.invalidate();

      toast({
        title: 'Order paid successfully!',
        description: 'Thanks for your purchase.',
        status: 'success',
        isClosable: true,
        duration: 5000,
      });
    },
  });

  return {
    fulfillPaypalOrder: mutation.mutate,
    isFulfillingPaypalOrder: mutation.isLoading,
  };
};
