import type Router from 'next/router';

import type { TUrlQueryKeysSchema } from '~/shared/schemas';
import { urlQueryKeysSchemas } from '~/shared/schemas';

import { URL_QUERY_KEYS } from '../constants/url-query-keys';

type TRouterQuery = typeof Router.query;
type TFilters = TUrlQueryKeysSchema;

export const getOnlyValidFilters = (filters: TRouterQuery): TFilters => {
  const keysToTrueObj = Object.values(URL_QUERY_KEYS).reduce((prev, curr) => {
    prev[curr] = true;
    return prev;
  }, {} as Record<string, boolean>);

  const validFilters: TFilters = {};
  Object.entries(filters).forEach(([key, value]) => {
    const validator =
      !!keysToTrueObj[key] &&
      !!urlQueryKeysSchemas[key] &&
      urlQueryKeysSchemas[key];
    const parsedScheme = !!validator && validator.safeParse(value);

    if (!!parsedScheme && parsedScheme.success) {
      validFilters[key] = parsedScheme.data;
    }
  });

  return validFilters;
};
