import { publicProcedure, router } from '~/server/trpc/trpc';
import { urlQueryKeysSchema } from '~/shared/schemas';

import type { SORT_OPTIONS } from '../filters/constants/url-query-keys';
import { URL_QUERY_KEYS } from '../filters/constants/url-query-keys';
import { productsBySlugRouteInputSchema } from './schemas';
import { getHomeProducts, getProductBySlug } from './services';

export const productsRouter = router({
  home: publicProcedure.input(urlQueryKeysSchema).query(async ({ input }) => {
    const categoryId = input[URL_QUERY_KEYS.CATEGORY_ID]?.toString();
    const minPrice = +(input[URL_QUERY_KEYS.MIN_PRICE] || '') * 100;
    let maxPrice: number | undefined =
      +(input[URL_QUERY_KEYS.MAX_PRICE] || '') * 100;
    if (maxPrice <= minPrice) {
      maxPrice = undefined;
    }
    const colorId = input[URL_QUERY_KEYS.COLOR_ID]?.toString();
    const sizeId = input[URL_QUERY_KEYS.SIZE_ID]?.toString();
    const search = input[URL_QUERY_KEYS.SEARCH]?.toString();
    const sort = (input[URL_QUERY_KEYS.SORT] ||
      'price-asc') as typeof SORT_OPTIONS[number];

    return getHomeProducts({
      categoryId,
      minPrice,
      maxPrice,
      colorId,
      sizeId,
      search,
      sort,
    });
  }),
  bySlug: publicProcedure
    .input(productsBySlugRouteInputSchema)
    .query(async ({ input }) => getProductBySlug(input.slug)),
});
