import create from 'zustand';
import { devtools } from 'zustand/middleware';

import { URL_QUERY_KEYS } from '../constants/url-query-keys';

type TFilters = Record<string, string | string[] | undefined>;

type TFiltersState = {
  filters: TFilters;
  actions: {
    setFilters: (filters: TFilters) => void;
    updateFilters: (filters: TFilters) => void;
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

const getOnlyValidFilters = (filters: TFilters): TFilters => {
  const keysToTrueObj = Object.values(URL_QUERY_KEYS).reduce((prev, curr) => {
    prev[curr] = true;
    return prev;
  }, {} as Record<string, boolean>);

  const validFilters: TFilters = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (keysToTrueObj[key]) {
      validFilters[key] = value;
    }
  });

  return validFilters;
};

export const useFilters = () => useFiltersStore((state) => state.filters);

export const useFiltersActions = () =>
  useFiltersStore((state) => state.actions);

export type { TFilters };
