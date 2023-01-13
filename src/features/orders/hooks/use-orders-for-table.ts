import type { RouterOutputs } from '~/shared/utils/trpc';
import { trpc } from '~/shared/utils/trpc';

const EMPTY_ARRAY: RouterOutputs['orders']['listForTable'] = [];

export const useOrdersForTable = (loggedInUserOnly = false) => {
  const query = trpc.orders.listForTable.useQuery({ loggedInUserOnly });

  return {
    orders: query.data || EMPTY_ARRAY,
    areTheOrdersLoading: query.isLoading,
  };
};
