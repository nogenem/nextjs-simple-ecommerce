export const calculatePrice = (price: number, discount = 0) =>
  price * (1 - discount / 100);
