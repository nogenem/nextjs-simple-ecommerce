import { trpc } from '~/shared/utils/trpc';

export const useProductBySlug = (slug = '') => {
  return trpc.products.bySlug.useQuery(slug, {
    enabled: !!slug,
  });
};
