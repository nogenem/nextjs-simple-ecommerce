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
  const { cancelPaypalOrderAsync, isCancelingPaypalOrder } =
    useCancelPaypalOrder();
  const { fulfillPaypalOrderAsync, isFulfillingPaypalOrder } =
    useFulfillPaypalOrder();

  const handleCreateOrder: PayPalButtonsComponentProps['createOrder'] = () => {
    return createPaypalOrderAsync({ orderId: order.id });
  };

  const handleError: PayPalButtonsComponentProps['onError'] = async () => {
    try {
      // Just to be sure...
      await cancelPaypalOrderAsync({ orderId: order.id });
    } catch (err) {
      console.error(err);
    }

    toast({
      title: 'Unable to process the payment.',
      description: 'Please, try again later',
      status: 'error',
      isClosable: true,
      duration: 5000,
    });
  };

  const handleApprove: PayPalButtonsComponentProps['onApprove'] = async (
    data,
  ) => {
    try {
      await fulfillPaypalOrderAsync({
        orderId: order.id,
        paypalApiOrderId: data.orderID,
      });
    } catch (err) {
      handleError({ err });
    }
  };

  const handleCancel: PayPalButtonsComponentProps['onCancel'] = async (
    data,
  ) => {
    try {
      await cancelPaypalOrderAsync({
        orderId: order.id,
        paypalApiOrderId: (data.orderID || data.id) as string,
      });
    } catch (err) {
      handleError({ err });
    }
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
        isLoading={isFulfillingPaypalOrder || isCancelingPaypalOrder}
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
