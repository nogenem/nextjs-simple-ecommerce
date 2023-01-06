import { useToast } from '@chakra-ui/react';

import { trpc } from '~/shared/utils/trpc';

export const useUpdateShippingAddress = () => {
  const toast = useToast();
  const utils = trpc.useContext();

  const mutation = trpc.orders.updateShippingAddress.useMutation({
    onSuccess: () => {
      utils.orders.invalidate();

      toast({
        title: 'Shipping address updated!',
        status: 'success',
        isClosable: true,
        duration: 5000,
      });
    },
    onError: () => {
      toast({
        title: 'Unable to update the shipping address.',
        description: 'Please, try again later',
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isLoading,
  };
};
