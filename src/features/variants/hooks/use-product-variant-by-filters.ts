import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

import type { Attribute } from '@prisma/client';
import { AttributeType } from '@prisma/client';

import { useFilters } from '~/features/filters/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';

const ATTRIBUTES_WEIGHTS = {
  // Color has priority
  [AttributeType.Color]: 2,
  [AttributeType.Size]: 1,
};

export const useProductVariantByFilters = (
  product: RouterOutputs['products']['bySlug'] | undefined,
) => {
  const router = useRouter();
  const { filters, areTheFiltersInitialized } = useFilters();

  const newQuery = useRef<Record<string, string> | undefined>(undefined);

  let variant = undefined;

  useEffect(() => {
    if (newQuery.current) {
      const url = {
        pathname: router.pathname,
        query: {
          ...router.query,
          ...newQuery.current,
        },
      };

      newQuery.current = undefined;
      router.push(url, undefined, { shallow: true });
    }
  }, [router, newQuery]);

  if (!areTheFiltersInitialized)
    return {
      variant,
      isVariantLoading: true,
    };
  if (!product || product.variants.length === 0)
    return {
      variant,
      isVariantLoading: false,
    };

  const possibleVariants = product.variants.filter((v) =>
    v.attributes
      .map((attr) => attr.id === filters[attributeTypeToFiltersKey(attr)])
      .some((bool) => !!bool),
  );
  variant = possibleVariants.find((v) =>
    v.attributes
      .map((attr) => attr.id === filters[attributeTypeToFiltersKey(attr)])
      .every((bool) => !!bool),
  );

  // If variant not found, push the most appropriate variant available
  if (!variant) {
    variant =
      getMostAppropriateVariant(possibleVariants, filters) ||
      product.variants[0];

    newQuery.current = variant?.attributes.reduce((prev, curr) => {
      prev[attributeTypeToFiltersKey(curr)] = curr.id;
      return prev;
    }, {} as Record<string, string>);
  }

  return { variant, isVariantLoading: false };
};

const attributeTypeToFiltersKey = (attribute: Attribute) =>
  `${attribute.type.toLowerCase()}_id`;

const getMostAppropriateVariant = (
  possibleVariants: NonNullable<
    RouterOutputs['products']['bySlug']
  >['variants'],
  filters: ReturnType<typeof useFilters>['filters'],
) => {
  const getAttributeWeight = (attr: Attribute) =>
    +(attr.id === filters[attributeTypeToFiltersKey(attr)]) *
    (ATTRIBUTES_WEIGHTS[attr.type] || 1);

  const variantsSortedByAttributeWeight = possibleVariants.sort((a, b) => {
    const aVal = a.attributes.reduce((prev, curr) => {
      return prev + getAttributeWeight(curr);
    }, 0);

    const bVal = b.attributes.reduce((prev, curr) => {
      return prev + getAttributeWeight(curr);
    }, 0);

    return bVal - aVal;
  });

  return variantsSortedByAttributeWeight[0];
};
