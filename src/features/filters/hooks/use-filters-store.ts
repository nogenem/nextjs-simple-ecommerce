import type Router from 'next/router';

import create from 'zustand';
import { devtools } from 'zustand/middleware';

import type { TUrlQueryKeysSchema } from '~/shared/schemas';

import { getOnlyValidFilters } from '../utils/get-only-valid-filters';

type TRouterQuery = typeof Router.query;
type TFilters = TUrlQueryKeysSchema;

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

export const useFilters = () => useFiltersStore((state) => state.filters);

export const useFilterByKey = (key: string) =>
  useFiltersStore((state) => state.filters[key]);

export const useFiltersActions = () =>
  useFiltersStore((state) => state.actions);

export type { TFilters };
