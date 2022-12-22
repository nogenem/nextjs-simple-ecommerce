import { useFilters } from '~/features/filters/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

export const useHomeProducts = () => {
  const filters = useFilters();
  const query = trpc.products.home.useQuery(filters);

  return {
    products: query.data || ([] as RouterOutputs['products']['home']),
    isLoading: query.isLoading,
  };
};
