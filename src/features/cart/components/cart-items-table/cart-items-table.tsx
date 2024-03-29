import type { TableContainerProps } from '@chakra-ui/react';
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
} & TableContainerProps;

const CartItemsTable = ({
  isEditable = false,
  ...rest
}: TCartItemsTableProps) => {
  const primaryColor = useColorModeValue('primary.500', 'primary.300');

  const [tableContainerRef] = useHorizontalScroll<HTMLDivElement>();

  const { items, areTheItemsLoading } = useCartItems();

  const cartSubtotal = formatPrice(calculateCartSubtotal(items));

  return (
    <TableContainer ref={tableContainerRef} w="100%" {...rest}>
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
          {areTheItemsLoading && (
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
