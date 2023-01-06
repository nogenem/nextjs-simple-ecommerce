import type { Attribute } from '@prisma/client';

export const getProductUrl = (
  productSlug: string,
  attributes?: Attribute[],
) => {
  const query = !attributes
    ? ''
    : '?' +
      attributes
        .map((attr) => `${attr.type.toLowerCase()}_id=${attr.id}`)
        .join('&');

  return `/p/${productSlug}${query}`;
};
