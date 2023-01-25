import { useFilters } from '~/features/filters/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

const EMPTY_ARRAY: RouterOutputs['products']['home'] = [];

export const useHomeProducts = () => {
  const { filters, areTheFiltersInitialized } = useFilters();
  const query = trpc.products.home.useQuery(filters, {
    enabled: areTheFiltersInitialized,
  });

  return {
    products: query.data || EMPTY_ARRAY,
    areTheHomeProductsLoading: query.isLoading,
  };
};
