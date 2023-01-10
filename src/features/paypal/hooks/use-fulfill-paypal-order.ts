import { trpc } from '~/shared/utils/trpc';

export const useFulfillPaypalOrder = () => {
  const utils = trpc.useContext();

  const mutation = trpc.paypal.fulfillOrder.useMutation({
    onSuccess: () => {
      utils.orders.invalidate();
    },
  });

  return {
    fulfillPaypalOrder: mutation.mutate,
    isFulfillingPaypalOrder: mutation.isLoading,
  };
};
