export const calculatePrice = (price: number, discount = 0) =>
  Math.round(price * (1 - discount / 100));
