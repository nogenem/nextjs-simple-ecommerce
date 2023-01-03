export const getOutOfStockLabelText = (quantity_in_stock: number) =>
  quantity_in_stock === 0
    ? "We don't have any of this item in stock"
    : `We only have ${quantity_in_stock} of this item available`;
