import type { RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

export const useCategories = () => {
  const query = trpc.categories.all.useQuery();

  return {
    categories: query.data || ([] as RouterOutputs['categories']['all']),
    isLoading: query.isLoading,
  };
};
