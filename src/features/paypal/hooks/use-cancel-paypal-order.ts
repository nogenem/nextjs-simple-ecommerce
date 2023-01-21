import { trpc } from '~/shared/utils/trpc';

export const useCancelPaypalOrder = () => {
  const utils = trpc.useContext();

  const mutation = trpc.paypal.cancelOrder.useMutation({
    onSuccess: () => {
      utils.orders.invalidate();
    },
  });

  return {
    cancelPaypalOrderAsync: mutation.mutateAsync,
    isCancelingPaypalOrder: mutation.isLoading,
  };
};
