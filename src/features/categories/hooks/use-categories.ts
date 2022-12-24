import type { RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

const EMPTY_ARRAY: RouterOutputs['categories']['all'] = [];

export const useCategories = () => {
  const query = trpc.categories.all.useQuery();

  return {
    categories: query.data || EMPTY_ARRAY,
    isLoading: query.isLoading,
  };
};
