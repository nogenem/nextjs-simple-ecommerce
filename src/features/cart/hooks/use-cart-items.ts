import type { RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

const EMPTY_ARRAY: RouterOutputs['cart']['items'] = [];

export const useCartItems = () => {
  const query = trpc.cart.items.useQuery();

  return {
    items: query.data || EMPTY_ARRAY,
    isLoading: query.isLoading,
  };
};
