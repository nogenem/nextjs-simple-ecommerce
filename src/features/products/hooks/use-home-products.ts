import { trpc } from '~/shared/utils/trpc';

export const useHomeProducts = () => {
  return trpc.products.home.useQuery();
};
