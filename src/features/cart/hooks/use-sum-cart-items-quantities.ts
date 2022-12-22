import { trpc } from '~/shared/utils/trpc';

export const useSumCartItemsQuantities = () => {
  const query = trpc.cart.sumItemsQuantities.useQuery();

  return {
    sum: query.data || 0,
  };
};
