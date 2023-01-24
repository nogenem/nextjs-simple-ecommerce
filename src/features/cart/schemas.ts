import { z } from 'zod';

export const addItemToCartRouteInputSchema = z.object({
  variantId: z.string(),
  quantity: z.number().min(1),
});

export type TAddItemToCartRouteInputSchema = z.infer<
  typeof addItemToCartRouteInputSchema
>;

export const countCartItemsByProductIdRouteInputSchema = z.object({
  productId: z.string(),
});

export type TCartItemsByProductIdRouteInputSchema = z.infer<
  typeof countCartItemsByProductIdRouteInputSchema
>;

export const removeCartItemRouteInputSchema = z.object({
  itemId: z.string(),
});

export type TRemoveCartItemRouteInputSchema = z.infer<
  typeof removeCartItemRouteInputSchema
>;

export const updateCartItemQuantityRouteInputSchema = z.object({
  itemId: z.string(),
  newQuantity: z.number().min(1),
});

export type TUpdateCartItemQuantityRouteInputSchema = z.infer<
  typeof updateCartItemQuantityRouteInputSchema
>;
