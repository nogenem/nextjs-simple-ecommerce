import type { TableContainerProps } from '@chakra-ui/react';
import { Table, TableContainer, Tbody, Th, Thead, Tr } from '@chakra-ui/react';

import { useHorizontalScroll } from '~/shared/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { TableItem } from './table-item';

type TOrderItemsTableProps = {
  items: NonNullable<RouterOutputs['orders']['byId']>['items'];
} & TableContainerProps;

const OrderItemsTable = ({ items, ...rest }: TOrderItemsTableProps) => {
  const [tableContainerRef] = useHorizontalScroll<HTMLDivElement>();

  return (
    <TableContainer ref={tableContainerRef} w="100%" {...rest}>
      <Table className="cart-table" variant="striped">
        <Thead>
          <Tr>
            <Th></Th>
            <Th>Product</Th>
            <Th>Quantity</Th>
            <Th>Price</Th>
          </Tr>
        </Thead>
        <Tbody>
          {items.map((item) => (
            <TableItem key={item.id} item={item} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export type { TOrderItemsTableProps };
export { OrderItemsTable };
