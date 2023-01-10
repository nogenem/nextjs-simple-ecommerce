import { trpc } from '~/shared/utils/trpc';

export const useCreatePaypalOrder = () => {
  const mutation = trpc.paypal.createOrder.useMutation({});

  return {
    createPaypalOrderAsync: mutation.mutateAsync,
    isCreatingPaypalOrder: mutation.isLoading,
  };
};
