import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

import {
  SORT_OPTIONS,
  URL_QUERY_KEYS,
} from '~/features/filters/constants/url-query-keys';

export const addressSchema = z.object({
  country: z.string().min(1),
  postal_code: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  street_address: z.string().min(1),
  complement: z.string().min(0),
});

export type TAddressSchema = z.infer<typeof addressSchema>;

export const paymentMethodSchema = z.nativeEnum(PaymentMethod);

export type TPaymentMethodSchema = z.infer<typeof paymentMethodSchema>;

export const urlQueryKeysSchemas = {
  [URL_QUERY_KEYS.CATEGORY_ID]: z.string().min(1),
  [URL_QUERY_KEYS.MIN_PRICE]: z.string().refine((val) => {
    const n = Number(val);
    return !Number.isNaN(n) && n >= 0;
  }),
  [URL_QUERY_KEYS.MAX_PRICE]: z.string().refine((val) => {
    const n = Number(val);
    return !Number.isNaN(n) && n >= 1;
  }),
  [URL_QUERY_KEYS.COLOR_ID]: z.string().min(1),
  [URL_QUERY_KEYS.SIZE_ID]: z.string().min(1),
  [URL_QUERY_KEYS.SEARCH]: z.string().min(1),
  [URL_QUERY_KEYS.SORT]: z.enum(SORT_OPTIONS),
};

export const urlQueryKeysSchema = z.object(urlQueryKeysSchemas).partial();

export type TUrlQueryKeysSchema = z.infer<typeof urlQueryKeysSchema>;
