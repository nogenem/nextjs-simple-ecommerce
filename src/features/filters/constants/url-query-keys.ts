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
