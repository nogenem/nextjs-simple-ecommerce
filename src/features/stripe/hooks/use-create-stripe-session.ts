import { trpc } from '~/shared/utils/trpc';

export const useCreateStripeSession = () => {
  const mutation = trpc.stripe.createSession.useMutation({});

  return {
    createStripeSessionAsync: mutation.mutateAsync,
    isCreatingStripeSession: mutation.isLoading,
  };
};
