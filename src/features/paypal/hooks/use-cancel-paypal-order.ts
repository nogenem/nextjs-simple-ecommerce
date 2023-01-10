import { trpc } from '~/shared/utils/trpc';

export const useCancelPaypalOrder = () => {
  const utils = trpc.useContext();

  const mutation = trpc.paypal.cancelOrder.useMutation({
    onSuccess: () => {
      utils.orders.invalidate();
    },
  });

  return {
    cancelPaypalOrder: mutation.mutate,
    isCancelingPaypalOrder: mutation.isLoading,
  };
};
