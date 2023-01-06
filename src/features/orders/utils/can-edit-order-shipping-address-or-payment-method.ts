import type { Order, PaymentDetail } from '@prisma/client';

export const canEditOrderShippingAddressOrPaymentMethod = (
  order: Order & { paymentDetail: PaymentDetail },
) => !order.paidAt && !order.paymentDetail.paymentMethodId;
