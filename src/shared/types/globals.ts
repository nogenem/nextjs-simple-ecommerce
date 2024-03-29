import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
  NextPage,
} from 'next';

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

export type TCartWithItems = Cart & {
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

export type TContextRequest = NextApiRequest | GetServerSidePropsContext['req'];

export type TContextResponse =
  | NextApiResponse
  | GetServerSidePropsContext['res'];

export type TNookiesContext = {
  req?: TContextRequest;
  res?: TContextResponse;
};
