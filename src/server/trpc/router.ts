import { attributesRouter } from '~/features/attributes/router';
import { cartRouter } from '~/features/cart/router';
import { categoriesRouter } from '~/features/categories/router';
import { ordersRouter } from '~/features/orders/router';
import { paypalRouter } from '~/features/paypal/router';
import { productsRouter } from '~/features/products/router';
import { router } from '~/server/trpc/trpc';

export const appRouter = router({
  products: productsRouter,
  categories: categoriesRouter,
  attributes: attributesRouter,
  cart: cartRouter,
  orders: ordersRouter,
  paypal: paypalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
