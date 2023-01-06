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
    onError: () => {
      toast({
        title: 'Unable to remove item from the cart.',
        description: 'Please, try again later',
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    },
  });

  return {
    removeItemFromCart: mutation.mutate,
    isRemovingItemFromCart: mutation.isLoading,
  };
};
