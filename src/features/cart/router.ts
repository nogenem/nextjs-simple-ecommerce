import type { CartItem } from '@prisma/client';
import { TRPCError } from '@trpc/server';

import { publicProcedure, router } from '~/server/trpc/trpc';

import { getVariantQuantityInStock } from '../variants/services';
import {
  addItemToCartRouteInputSchema,
  countCartItemsByProductIdRouteInputSchema,
  removeCartItemRouteInputSchema,
  updateCartItemQuantityRouteInputSchema,
} from './schemas';
import {
  addItemToGuestCart,
  countGuestCartItemsByProductId,
  getGuestCartItem,
  getGuestCartItems,
  removeGuestCartItem,
  sumGuestCartItemsQuantities,
  updateGuestCartItemQuantity,
} from './services/guest';
import {
  addItemToUserCart,
  countUserCartItemsByProductId,
  getUserCartItemQuantityInStock,
  getUserCartItems,
  removeUserCartItem,
  sumUserCartItemsQuantities,
  updateUserCartItemQuantity,
} from './services/user';

export const cartRouter = router({
  addItem: publicProcedure
    .input(addItemToCartRouteInputSchema)
    .mutation(async ({ input, ctx }): Promise<CartItem> => {
      const user = ctx.session?.user;
      if (user) {
        return await addItemToUserCart(
          user.id,
          input.variantId,
          input.quantity,
        );
      } else {
        return addItemToGuestCart(ctx, input.variantId, input.quantity);
      }
    }),
  sumItemsQuantities: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user;
    if (user) {
      return sumUserCartItemsQuantities(user.id);
    } else {
      return sumGuestCartItemsQuantities(ctx);
    }
  }),
  countItemsByProductId: publicProcedure
    .input(countCartItemsByProductIdRouteInputSchema)
    .query(async ({ input, ctx }) => {
      const user = ctx.session?.user;
      if (user) {
        return countUserCartItemsByProductId(user.id, input.productId);
      } else {
        return countGuestCartItemsByProductId(ctx, input.productId);
      }
    }),
  items: publicProcedure.query(async ({ ctx }) => {
    const user = ctx.session?.user;
    if (user) {
      return getUserCartItems(user.id);
    } else {
      return getGuestCartItems(ctx);
    }
  }),
  removeItem: publicProcedure
    .input(removeCartItemRouteInputSchema)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;
      if (user) {
        return removeUserCartItem(user.id, input.itemId);
      } else {
        const item = removeGuestCartItem(ctx, input.itemId);

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found.',
          });
        }

        return item;
      }
    }),
  updateItemQuantity: publicProcedure
    .input(updateCartItemQuantityRouteInputSchema)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;
      if (user) {
        const quantityInStock = await getUserCartItemQuantityInStock(
          user.id,
          input.itemId,
        );

        if (quantityInStock === null) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found.',
          });
        }

        if (quantityInStock < input.newQuantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not enough products in stock.',
          });
        }

        return await updateUserCartItemQuantity(
          user.id,
          input.itemId,
          input.newQuantity,
        );
      } else {
        const cartItem = getGuestCartItem(ctx, input.itemId);

        if (!cartItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found.',
          });
        }

        const quantityInStock = await getVariantQuantityInStock(
          cartItem.variantId,
        );

        if (quantityInStock === null) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product variant not found.',
          });
        }

        if (quantityInStock < input.newQuantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Not enough products in stock.',
          });
        }

        return updateGuestCartItemQuantity(
          ctx,
          input.itemId,
          input.newQuantity,
        );
      }
    }),
});
