import { trpc } from '~/shared/utils/trpc';

export const useOrderById = (orderId = '') => {
  const query = trpc.orders.byId.useQuery(
    { orderId },
    {
      enabled: !!orderId,
    },
  );

  return {
    order: query.data,
    isOrderLoading: query.isLoading,
  };
};
