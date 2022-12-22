import { trpc } from '~/shared/utils/trpc';

export const useSumCartItemsQuantities = () => {
  return trpc.cart.sumItemsQuantities.useQuery();
};
