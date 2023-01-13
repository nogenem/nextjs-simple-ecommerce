import { MdRemoveRedEye } from 'react-icons/md';

import Link from 'next/link';

import { Badge, IconButton, Td, Text, Tooltip, Tr } from '@chakra-ui/react';

import { formatPrice } from '~/shared/utils/format-price';
import type { RouterOutputs } from '~/shared/utils/trpc';

import { getOrderStatus } from '../../utils/get-order-status';

type TTableItemProps = {
  order: RouterOutputs['orders']['listForTable'][number];
};

const TableItem = ({ order }: TTableItemProps) => {
  const status = getOrderStatus(order);

  return (
    <Tr>
      <Td>
        <Badge>{order.id}</Badge>
      </Td>
      <Td>{order.created_at.toLocaleString()}</Td>
      <Td>
        <Text textTransform="capitalize">
          {order.paymentDetail.paymentMethod.toLowerCase()}
        </Text>
      </Td>
      <Td>{formatPrice(order.totalPrice, order.currency_code)}</Td>
      <Td>{status}</Td>
      <Td>
        <Link href={`/order/${order.id}`}>
          <Tooltip label="View order">
            <IconButton aria-label="View order" icon={<MdRemoveRedEye />} />
          </Tooltip>
        </Link>
      </Td>
    </Tr>
  );
};

export type { TTableItemProps };
export { TableItem };
