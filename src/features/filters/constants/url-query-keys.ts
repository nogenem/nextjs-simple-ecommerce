import { z } from 'zod';

export const SORT_OPTIONS = [
  'price-asc',
  'price-desc',
  'name-asc',
  'name-desc',
] as const;

export const URL_QUERY_KEYS = {
  CATEGORY_ID: 'category_id',
  MIN_PRICE: 'min_price',
  MAX_PRICE: 'max_price',
  COLOR_ID: 'color_id',
  SIZE_ID: 'size_id',
  SEARCH: 'search',
  SORT: 'sort',
};

export const URL_QUERY_KEYS_VALIDATIONS = {
  [URL_QUERY_KEYS.CATEGORY_ID]: z.string().min(1),
  [URL_QUERY_KEYS.MIN_PRICE]: z.string().refine((val) => {
    const n = Number(val);
    return !Number.isNaN(n) && n >= 0;
  }),
  [URL_QUERY_KEYS.MAX_PRICE]: z.string().refine((val) => {
    const n = Number(val);
    return !Number.isNaN(n) && n >= 1;
  }),
  [URL_QUERY_KEYS.COLOR_ID]: z.string().min(1),
  [URL_QUERY_KEYS.SIZE_ID]: z.string().min(1),
  [URL_QUERY_KEYS.SEARCH]: z.string().min(1),
  [URL_QUERY_KEYS.SORT]: z.enum(SORT_OPTIONS),
};

export const URL_QUERY_KEYS_SCHEME = z
  .object(URL_QUERY_KEYS_VALIDATIONS)
  .partial();
