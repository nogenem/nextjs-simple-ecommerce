export const getOutOfStockLabelText = (quantityInStock: number) =>
  quantityInStock === 0
    ? "We don't have any of this item in stock"
    : `We only have ${quantityInStock} of this item available`;
