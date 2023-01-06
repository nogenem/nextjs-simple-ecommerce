import type { CircularProgressProps, FlexProps } from '@chakra-ui/react';
import { CircularProgress, Flex } from '@chakra-ui/react';

type TCenteredLoadingIndicatorProps = CircularProgressProps & {
  containerProps?: FlexProps;
};

const CenteredLoadingIndicator = ({
  containerProps,
  ...rest
}: TCenteredLoadingIndicatorProps) => {
  return (
    <Flex
      w="100%"
      alignItems="center"
      justifyContent="center"
      {...containerProps}
    >
      <CircularProgress isIndeterminate color="primary.300" {...rest} />
    </Flex>
  );
};

export type { TCenteredLoadingIndicatorProps };
export { CenteredLoadingIndicator };
