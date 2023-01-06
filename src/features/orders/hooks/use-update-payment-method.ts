import { useToast } from '@chakra-ui/react';

import { trpc } from '~/shared/utils/trpc';

export const useUpdatePaymentMethod = () => {
  const toast = useToast();
  const utils = trpc.useContext();

  const mutation = trpc.orders.updatePaymentMethod.useMutation({
    onSuccess: () => {
      utils.orders.invalidate();

      toast({
        title: 'Payment method updated!',
        status: 'success',
        isClosable: true,
        duration: 5000,
      });
    },
    onError: () => {
      toast({
        title: 'Unable to update the payment method.',
        description: 'Please, try again later',
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    },
  });

  return {
    updatePaymentMethodAsync: mutation.mutateAsync,
    isUpdatingPaymentMethod: mutation.isLoading,
  };
};
