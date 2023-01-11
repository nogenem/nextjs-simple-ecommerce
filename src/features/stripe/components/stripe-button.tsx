import { useRouter } from 'next/router';

import { Button, useToast } from '@chakra-ui/react';

import type { RouterOutputs } from '~/shared/utils/trpc';

import { useCreateStripeSession } from '../hooks';

type TStripeButtonProps = {
  order: NonNullable<RouterOutputs['orders']['byId']>;
};

const StripeButton = ({ order }: TStripeButtonProps) => {
  const router = useRouter();
  const toast = useToast();

  const { createStripeSessionAsync, isCreatingStripeSession } =
    useCreateStripeSession();

  const handleOnClick = async () => {
    try {
      const sessionUrl = await createStripeSessionAsync({
        orderId: order.id,
      });

      if (!sessionUrl) throw new Error('Invalid session url');

      router.push(sessionUrl);
    } catch (err) {
      toast({
        title: 'Unable to create a session with Stripe.',
        description: 'Please, try again later',
        status: 'error',
        isClosable: true,
        duration: 5000,
      });
    }
  };

  return (
    <Button
      colorScheme="stripe"
      onClick={handleOnClick}
      isLoading={isCreatingStripeSession}
    >
      Pay with Stripe
    </Button>
  );
};

export type { TStripeButtonProps };
export { StripeButton };
