import { z } from 'zod';

export const URL_QUERY_KEYS = {
  CATEGORY_ID: 'category_id',
  MIN_PRICE: 'min_price',
  MAX_PRICE: 'max_price',
  COLOR_ID: 'color_id',
  SIZE_ID: 'size_id',
};

export const URL_QUERY_KEYS_SCHEME = {
  [URL_QUERY_KEYS.CATEGORY_ID]: z.string(),
  [URL_QUERY_KEYS.MIN_PRICE]: z.union([
    z.coerce.number().gte(0),
    z.string().length(0),
  ]),
  [URL_QUERY_KEYS.MAX_PRICE]: z.union([
    z.coerce.number().gte(0),
    z.string().length(0),
  ]),
  [URL_QUERY_KEYS.COLOR_ID]: z.string(),
  [URL_QUERY_KEYS.SIZE_ID]: z.string(),
};
