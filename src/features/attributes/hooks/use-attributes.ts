import type { RouterInputs, RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

const EMPTY_ARRAY: RouterOutputs['attributes']['all'] = [];

export const useAttributes = (filters: RouterInputs['attributes']['all']) => {
  const query = trpc.attributes.all.useQuery(filters);

  return {
    attributes: query.data || EMPTY_ARRAY,
    areTheAttributesLoading: query.isLoading,
  };
};
