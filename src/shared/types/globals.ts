import type { NextPage } from 'next';

import type { Cart, CartItem } from '@prisma/client';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

export type CartWithItems = Cart & {
  items: CartItem[];
};
