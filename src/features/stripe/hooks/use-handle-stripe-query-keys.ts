import { useEffect } from 'react';

import { useRouter } from 'next/router';

import { useToast } from '@chakra-ui/react';

export const useHandleStripeQueryKeys = () => {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    let shouldUpdateRouterQuery = false;
    let ignoreRouterQueryKey: string | undefined = undefined;

    if (router.query.stripe_error) {
      console.error('Stripe error', router.query.stripe_error);

      toast({
        title: 'An error occurred while handling the Stripe payment.',
        description: 'If you completed your payment, please contact us.',
        status: 'error',
        isClosable: true,
        duration: 10000,
      });

      shouldUpdateRouterQuery = true;
      ignoreRouterQueryKey = 'stripe_error';
    } else if (
      router.query.stripe_success &&
      router.query.stripe_success === 'true'
    ) {
      toast({
        title: 'Order paid successfully!',
        description: 'Thanks for your purchase.',
        status: 'success',
        isClosable: true,
        duration: 10000,
      });

      shouldUpdateRouterQuery = true;
      ignoreRouterQueryKey = 'stripe_success';
    }

    if (shouldUpdateRouterQuery && !!ignoreRouterQueryKey) {
      const newQuery = Object.keys(router.query).reduce((prev, curr) => {
        if (curr !== ignoreRouterQueryKey) {
          prev[curr] = router.query[curr];
        }
        return prev;
      }, {} as typeof router.query);

      router.push({ pathname: router.pathname, query: newQuery }, undefined, {
        shallow: true,
      });
    }
  }, [router, toast]);
};
