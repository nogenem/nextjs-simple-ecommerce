import { trpc } from '~/shared/utils/trpc';

export const useSumCartQuantities = () => {
  return trpc.cart.sumQuantities.useQuery();
};
