import type { RouterInputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

export const useAttributes = (filters: RouterInputs['attributes']['all']) => {
  return trpc.attributes.all.useQuery(filters);
};
