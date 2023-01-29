import type { RouterInputs, RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

const EMPTY_ARRAY: RouterOutputs['attributes']['byType'] = [];

export const useAttributesByType = (
  type: RouterInputs['attributes']['byType'],
) => {
  const query = trpc.attributes.byType.useQuery(type);

  return {
    attributes: query.data || EMPTY_ARRAY,
    areTheAttributesLoading: query.isLoading,
  };
};
