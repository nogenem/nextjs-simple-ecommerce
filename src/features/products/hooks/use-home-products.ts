import { INITIAL_EMPTY_FILTERS, useFilters } from '~/features/filters/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

const EMPTY_ARRAY: RouterOutputs['products']['home'] = [];

export const useHomeProducts = () => {
  const filters = useFilters();
  const query = trpc.products.home.useQuery(filters, {
    enabled: filters !== INITIAL_EMPTY_FILTERS,
  });

  return {
    products: query.data || EMPTY_ARRAY,
    areTheHomeProductsLoading: query.isLoading,
  };
};
