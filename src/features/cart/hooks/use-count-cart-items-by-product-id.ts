import { trpc } from '~/shared/utils/trpc';

export const useCountCartItemsByProductId = (productId?: string) => {
  return trpc.cart.countItemsByProductId.useQuery({
    productId,
  });
};
