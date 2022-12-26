import { useToast } from '@chakra-ui/react';

import { trpc } from '~/shared/utils/trpc';

export const useUpdateItemQuantity = () => {
  const toast = useToast();
  const utils = trpc.useContext();

  const mutation = trpc.cart.updateItemQuantity.useMutation({
    onSuccess: () => {
      utils.cart.invalidate();

      toast({
        title: 'Item quantity updated!',
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
        title: 'Unable to update item quantity.',
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
    isError: mutation.isError,
    lastValuesUsed: mutation.variables,
  };
};
