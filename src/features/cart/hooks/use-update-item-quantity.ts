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
    onError: () => {
      toast({
        title: 'Unable to update item quantity.',
        description: 'Please, try again later',
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    },
  });

  return {
    updateItemQuantity: mutation.mutate,
    isUpdatingItemQuantity: mutation.isLoading,
    gotAnErrorWhileUpdatingItemQuantity: mutation.isError,
    lastValuesUsedToUpdateItemQuantity: mutation.variables,
  };
};
