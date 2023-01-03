import type { NextPage } from 'next';

import type {
  Attribute,
  Cart,
  CartItem,
  Discount,
  Product,
  Variant,
  VariantImage,
} from '@prisma/client';

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

export type CartWithItems = Cart & {
  items: CartItem[];
};

export type TCartItemWithVariant = CartItem & {
  variant:
    | (Variant & {
        product: Product & {
          discount: Discount | null;
        };
        attributes: Attribute[];
        images: VariantImage[];
      })
    | undefined;
};

// TODO: Will come from Prisma later
export type Address = {
  complement?: string;
  country: string;
  postal_code: string;
  state: string;
  city: string;
  street_address: string;
};
