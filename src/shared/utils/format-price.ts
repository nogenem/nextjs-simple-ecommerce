export function formatPrice(price: number, currencyCode: string, discount = 0) {
  const value = (price / 100) * (1 - discount / 100 / 100);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}
