import { useFilters } from '~/features/filters/hooks';
import { trpc } from '~/shared/utils/trpc';

export const useHomeProducts = () => {
  const filters = useFilters();

  return trpc.products.home.useQuery(filters);
};
