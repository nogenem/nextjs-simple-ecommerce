import { trpc } from '~/shared/utils/trpc';

export const useCountCartItemsByProductId = (productId = '') => {
  const query = trpc.cart.countItemsByProductId.useQuery(
    {
      productId,
    },
    {
      enabled: !!productId,
    },
  );

  return {
    count: query.data || 0,
  };
};
