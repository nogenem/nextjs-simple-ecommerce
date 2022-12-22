import { trpc } from '~/shared/utils/trpc';

export const useCountCartItemsByProductId = (productId?: string) => {
  const query = trpc.cart.countItemsByProductId.useQuery({
    productId,
  });

  return {
    count: query.data || 0,
  };
};
