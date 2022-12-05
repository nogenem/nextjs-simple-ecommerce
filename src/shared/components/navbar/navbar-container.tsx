import React from 'react';

import type { FlexProps } from '@chakra-ui/react';
import { Flex, useColorModeValue } from '@chakra-ui/react';

type TNavbarContainerProps = FlexProps & {
  children: React.ReactNode;
};

const NavbarContainer = ({ children, ...rest }: TNavbarContainerProps) => {
  const mainBgColor = useColorModeValue('primary.600', 'gray.700');
  const mainColor = useColorModeValue('primary.600', 'white');

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      p={4}
      bg={[mainBgColor, mainBgColor, 'transparent', 'transparent']}
      color={['white', 'white', mainColor, mainColor]}
      {...rest}
    >
      {children}
    </Flex>
  );
};

export type { TNavbarContainerProps };
export { NavbarContainer };
