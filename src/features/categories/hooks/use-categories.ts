import { trpc } from '~/shared/utils/trpc';

export const useCategories = () => {
  return trpc.categories.all.useQuery();
};
