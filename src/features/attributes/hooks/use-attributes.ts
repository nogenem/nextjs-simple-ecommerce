import type { RouterInputs, RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

export const useAttributes = (filters: RouterInputs['attributes']['all']) => {
  const query = trpc.attributes.all.useQuery(filters);

  return {
    attributes: query.data || ([] as RouterOutputs['attributes']['all']),
    isLoading: query.isLoading,
  };
};
