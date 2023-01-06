import type { ReactNode } from 'react';

import type { AlertProps, FlexProps } from '@chakra-ui/react';
import { Alert, AlertIcon, Flex } from '@chakra-ui/react';

type TCenteredAlertProps = AlertProps & {
  icon?: ReactNode;
  containerProps?: FlexProps;
};

const CenteredAlert = ({
  children,
  icon = <AlertIcon />,
  containerProps,
  ...rest
}: TCenteredAlertProps) => {
  return (
    <Flex
      w="100%"
      alignItems="center"
      justifyContent="center"
      {...containerProps}
    >
      <Alert status="error" maxW="65rem" {...rest}>
        {icon}
        {children}
      </Alert>
    </Flex>
  );
};

export type { TCenteredAlertProps };
export { CenteredAlert };
