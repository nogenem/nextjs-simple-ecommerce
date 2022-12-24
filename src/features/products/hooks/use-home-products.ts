import { useFilters } from '~/features/filters/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

const EMPTY_ARRAY: RouterOutputs['products']['home'] = [];

export const useHomeProducts = () => {
  const filters = useFilters();
  const query = trpc.products.home.useQuery(filters);

  return {
    products: query.data || EMPTY_ARRAY,
    isLoading: query.isLoading,
  };
};
