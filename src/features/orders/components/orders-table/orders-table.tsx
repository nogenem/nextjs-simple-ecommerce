import type { TableContainerProps } from '@chakra-ui/react';
import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

import { useHorizontalScroll } from '~/shared/hooks';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { TableItem } from './table-item';

type TOrdersTableProps = {
  orders: RouterOutputs['orders']['listForTable'];
  isLoading: boolean;
} & TableContainerProps;

const OrdersTable = ({ orders, isLoading, ...rest }: TOrdersTableProps) => {
  const [tableContainerRef] = useHorizontalScroll<HTMLDivElement>();

  return (
    <TableContainer ref={tableContainerRef} w="100%" {...rest}>
      <Table className="cart-table" variant="striped">
        <Thead>
          <Tr>
            <Th>#</Th>
            <Th>Date</Th>
            <Th>Method</Th>
            <Th>Total price</Th>
            <Th>Status</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && (
            <Tr>
              <Td colSpan={6}>Loading...</Td>
            </Tr>
          )}
          {orders.map((order) => (
            <TableItem key={order.id} order={order} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export type { TOrdersTableProps };
export { OrdersTable };
