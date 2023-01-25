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

const INITIAL_EMPTY_FILTERS = {} as TFilters;

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

export const useFilters = () => {
  const filters = useFiltersStore((state) => state.filters);
  return {
    filters,
    areTheFiltersInitialized: filters !== INITIAL_EMPTY_FILTERS,
  };
};

export const useFilterByKey = (key: string) =>
  useFiltersStore((state) => state.filters[key]);

export const useFiltersActions = () =>
  useFiltersStore((state) => state.actions);

export const manuallySetFilters = (filters: TRouterQuery) =>
  useFiltersStore.setState({
    filters: getOnlyValidFilters(filters),
  });

export type { TFilters };
