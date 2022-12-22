import { useToast } from '@chakra-ui/react';

import { trpc } from '~/shared/utils/trpc';

export const useAddItemToCart = () => {
  const toast = useToast();
  const utils = trpc.useContext();

  const mutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      utils.cart.invalidate();

      toast({
        title: 'Product added to the cart!',
        status: 'success',
        isClosable: true,
        duration: 5000,
      });
    },
    onError: () => {
      toast({
        title: 'Unable to add product to the cart.',
        description: 'Please, try again later',
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
