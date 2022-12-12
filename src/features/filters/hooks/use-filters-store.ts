import type Router from 'next/router';

import create from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  URL_QUERY_KEYS,
  URL_QUERY_KEYS_SCHEME,
} from '../constants/url-query-keys';

type TRouterQuery = typeof Router.query;
type TFilters = Record<string, string | string[]>;

type TFiltersState = {
  filters: TFilters;
  actions: {
    setFilters: (filters: TRouterQuery) => void;
    updateFilters: (filters: TRouterQuery) => void;
  };
};

const useFiltersStore = create<TFiltersState>()(
  devtools(
    (set) => ({
      filters: {},
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

const getOnlyValidFilters = (filters: TRouterQuery): TFilters => {
  const keysToTrueObj = Object.values(URL_QUERY_KEYS).reduce((prev, curr) => {
    prev[curr] = true;
    return prev;
  }, {} as Record<string, boolean>);

  const validFilters: TFilters = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (
      keysToTrueObj[key] &&
      !!URL_QUERY_KEYS_SCHEME[key] &&
      URL_QUERY_KEYS_SCHEME[key]?.safeParse(value).success
    ) {
      validFilters[key] = value || '';
    }
  });

  return validFilters;
};

export const useFilters = () => useFiltersStore((state) => state.filters);

export const useFiltersActions = () =>
  useFiltersStore((state) => state.actions);

export type { TFilters };
