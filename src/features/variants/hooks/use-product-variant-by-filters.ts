import { useRouter } from 'next/router';

import type { Attribute } from '@prisma/client';

import { useFilters } from '~/features/filters/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';

export const useProductVariantByFilters = (
  product: RouterOutputs['products']['bySlug'] | undefined,
) => {
  const router = useRouter();
  const filters = useFilters();

  if (!product || product.variants.length === 0) return null;

  const possibleVariants = product.variants.filter((v) =>
    v.attributes
      .map((attr) => attr.id === filters[attributeTypeToFiltersKey(attr)])
      .some((bool) => !!bool),
  );
  const variant = possibleVariants.find((v) =>
    v.attributes
      .map((attr) => attr.id === filters[attributeTypeToFiltersKey(attr)])
      .every((bool) => !!bool),
  );

  // If variant not found, push the first variant available
  if (!variant) {
    const firstVariant =
      possibleVariants.length > 0 ? possibleVariants[0] : product.variants[0];

    const newQuery = firstVariant?.attributes.reduce((prev, curr) => {
      const key = attributeTypeToFiltersKey(curr);
      if (!filters[key]) {
        prev[key] = curr.id;
      }
      return prev;
    }, {} as Record<string, string>);

    const url = {
      pathname: router.pathname,
      query: {
        ...router.query,
        ...newQuery,
      },
    };
    router.push(url);
  }

  return variant;
};

const attributeTypeToFiltersKey = (attribute: Attribute) =>
  `${attribute.type.toLowerCase()}_id`;
