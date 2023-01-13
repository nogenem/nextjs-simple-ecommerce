import type Router from 'next/router';

import type { z } from 'zod';
import create from 'zustand';
import { devtools } from 'zustand/middleware';

import type { URL_QUERY_KEYS_SCHEME } from '../constants/url-query-keys';
import {
  URL_QUERY_KEYS,
  URL_QUERY_KEYS_VALIDATIONS,
} from '../constants/url-query-keys';

type TRouterQuery = typeof Router.query;
type TFilters = z.infer<typeof URL_QUERY_KEYS_SCHEME>;

type TFiltersState = {
  filters: TFilters;
  actions: {
    setFilters: (filters: TRouterQuery) => void;
    updateFilters: (filters: TRouterQuery) => void;
  };
};

export const INITIAL_EMPTY_FILTERS = {} as TFilters;

const useFiltersStore = create<TFiltersState>()(
  devtools(
    (set) => ({
      filters: INITIAL_EMPTY_FILTERS,
      actions: {
        setFilters: (filters) =>
          set(() => ({ filters: getOnlyValidFilters(filters) }), false, {
            type: 'filters/setFilters',
            filters,
          }),
        updateFilters: (filters) =>
          set(
            (state) => ({
              filters: { ...state.filters, ...getOnlyValidFilters(filters) },
            }),
            false,
            {
              type: 'filters/updateFilters',
              filters,
            },
          ),
      },
    }),
    { enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export const getOnlyValidFilters = (filters: TRouterQuery): TFilters => {
  const keysToTrueObj = Object.values(URL_QUERY_KEYS).reduce((prev, curr) => {
    prev[curr] = true;
    return prev;
  }, {} as Record<string, boolean>);

  const validFilters: TFilters = {};
  Object.entries(filters).forEach(([key, value]) => {
    const validator =
      !!keysToTrueObj[key] &&
      !!URL_QUERY_KEYS_VALIDATIONS[key] &&
      URL_QUERY_KEYS_VALIDATIONS[key];
    const parsedScheme = !!validator && validator.safeParse(value);

    if (!!parsedScheme && parsedScheme.success) {
      validFilters[key] = parsedScheme.data;
    }
  });

  return validFilters;
};

export const useFilters = () => useFiltersStore((state) => state.filters);

export const useFilterByKey = (key: string) =>
  useFiltersStore((state) => state.filters[key]);

export const useFiltersActions = () =>
  useFiltersStore((state) => state.actions);

export type { TFilters };
