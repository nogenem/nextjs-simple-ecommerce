import { useRef } from 'react';

import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from '@chakra-ui/react';

import { useHorizontalScroll } from '~/shared/hooks';
import { formatPrice } from '~/shared/utils/format-price';

import { useCartItems } from '../../hooks';
import { calculateCartSubtotal } from '../../utils/calculate-cart-subtotal';
import { TableItem } from './table-item';

type TCartItemsTableProps = {
  isEditable?: boolean;
};

const CartItemsTable = ({ isEditable = false }: TCartItemsTableProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const primaryColor = useColorModeValue('primary.500', 'primary.300');

  const { items, isLoading } = useCartItems();

  useHorizontalScroll(tableContainerRef);

  const cartSubtotal = formatPrice(calculateCartSubtotal(items));

  return (
    <TableContainer ref={tableContainerRef} w="100%" mb="3">
      <Table className="cart-table" variant="striped">
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Product</Th>
            <Th>Quantity</Th>
            <Th>Price</Th>
            {isEditable && <Th>Remove</Th>}
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && (
            <Tr>
              <Td colSpan={isEditable ? 5 : 4}>Loading...</Td>
            </Tr>
          )}
          {items.map((item) => (
            <TableItem key={item.id} item={item} isEditable={isEditable} />
          ))}
        </Tbody>
        <Tfoot>
          <Tr>
            <Td></Td>
            <Td></Td>
            <Td color={primaryColor} fontSize="xl" textTransform="uppercase">
              Subtotal:
            </Td>
            <Td color={primaryColor} fontSize="xl">
              {cartSubtotal}
            </Td>
            {isEditable && <Td></Td>}
          </Tr>
        </Tfoot>
      </Table>
    </TableContainer>
  );
};

export type { TCartItemsTableProps };
export { CartItemsTable };
