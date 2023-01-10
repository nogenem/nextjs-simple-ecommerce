import { useToast } from '@chakra-ui/react';
import type { PayPalButtonsComponentProps } from '@paypal/react-paypal-js';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';

import { env } from '~/env/client.mjs';
import { CenteredLoadingIndicator } from '~/shared/components';
import type { RouterOutputs } from '~/shared/utils/trpc';

import {
  useCancelPaypalOrder,
  useCreatePaypalOrder,
  useFulfillPaypalOrder,
} from '../hooks';

type TPaypalButtonProps = {
  order: NonNullable<RouterOutputs['orders']['byId']>;
};

const PaypalButton = ({ order }: TPaypalButtonProps) => {
  const toast = useToast();

  const { createPaypalOrderAsync } = useCreatePaypalOrder();
  const { cancelPaypalOrder } = useCancelPaypalOrder();
  const { fulfillPaypalOrder, isFulfillingPaypalOrder } =
    useFulfillPaypalOrder();

  const handleCreateOrder: PayPalButtonsComponentProps['createOrder'] = () =>
    createPaypalOrderAsync({ orderId: order.id });

  const handleApprove: PayPalButtonsComponentProps['onApprove'] = async (
    data,
  ) =>
    fulfillPaypalOrder({
      orderId: order.id,
      paypalOrderId: data.orderID,
    });

  const handleCancel: PayPalButtonsComponentProps['onCancel'] = (data) =>
    cancelPaypalOrder({
      orderId: order.id,
      paypalOrderId: (data.orderID || data.id) as string,
    });

  const handleError: PayPalButtonsComponentProps['onError'] = () => {
    toast({
      title: 'Unable to process the payment.',
      description: 'Please, try again later',
      status: 'error',
      isClosable: true,
      duration: 5000,
    });
  };

  return (
    <PayPalScriptProvider
      options={{
        'client-id': env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency: order.currency_code,
        components: 'buttons',
      }}
    >
      <Button
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onCancel={handleCancel}
        onError={handleError}
        isLoading={isFulfillingPaypalOrder}
      />
    </PayPalScriptProvider>
  );
};

type TButtonProps = {
  isLoading: boolean;
} & PayPalButtonsComponentProps;

const Button = ({ isLoading, ...rest }: TButtonProps) => {
  const [{ isPending }] = usePayPalScriptReducer();

  if (isPending || isLoading) {
    return <CenteredLoadingIndicator />;
  }

  return (
    <PayPalButtons style={{ layout: 'horizontal', shape: 'rect' }} {...rest} />
  );
};

export type { TPaypalButtonProps };
export { PaypalButton };
