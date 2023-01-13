export const getOrderStatus = (order: {
  paidAt: Date | null;
  shippedAt: Date | null;
}) => {
  if (!order.paidAt) return 'Waiting payment';
  else if (!order.shippedAt) return 'Waiting shipping';
  else return 'Shipped';
};
