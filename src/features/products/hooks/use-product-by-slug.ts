import { trpc } from '~/shared/utils/trpc';

export const useProductBySlug = (slug = '') => {
  const query = trpc.products.bySlug.useQuery(slug, {
    enabled: !!slug,
  });

  return {
    product: query.data,
    isLoading: query.isLoading,
  };
};
