import { useToast } from '@chakra-ui/react';

import { trpc } from '~/shared/utils/trpc';

export const useRemoveItemFromCart = () => {
  const toast = useToast();
  const utils = trpc.useContext();

  const mutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => {
      utils.cart.invalidate();

      toast({
        title: 'Item removed from the cart!',
        status: 'success',
        isClosable: true,
        duration: 5000,
      });
    },
    onError: (error) => {
      const description =
        !error.data || error.data.code === 'INTERNAL_SERVER_ERROR'
          ? 'Please, try again later'
          : error.message;

      toast({
        title: 'Unable to remove item from the cart.',
        description,
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isLoading,
  };
};
