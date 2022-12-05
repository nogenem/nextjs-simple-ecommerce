import { useMemo } from 'react';

import type { IconButtonProps } from '@chakra-ui/react';
import {
  forwardRef,
  IconButton,
  useBreakpointValue,
  useColorMode,
} from '@chakra-ui/react';

type TNavbarIconButtonProps = IconButtonProps;

const NavbarIconButton = forwardRef<TNavbarIconButtonProps, typeof IconButton>(
  ({ 'aria-label': ariaLabel, ...rest }: TNavbarIconButtonProps, ref) => {
    const { colorMode } = useColorMode();

    const colorScheme = useBreakpointValue({
      base: 'gray',
      md: colorMode === 'light' ? 'primary' : 'gray',
    });

    const ghostVariantProps = useMemo(
      () => getNavbarGhostProps(colorScheme || 'gray', colorMode),
      [colorScheme, colorMode],
    );

    return (
      <IconButton
        ref={ref}
        aria-label={ariaLabel}
        title={ariaLabel}
        display="flex"
        alignItems="center"
        justifyContent="center"
        w={8}
        minW={8}
        h={8}
        {...ghostVariantProps}
        {...rest}
      />
    );
  },
);

// https://github.com/chakra-ui/chakra-ui/blob/main/packages/theme/src/components/button.ts#L28
// PS: I needed to change some colors cause the Navbar background is primary
const getNavbarGhostProps = (colorScheme: string, colorMode: string) => {
  if (colorScheme === 'gray') {
    return {
      color: colorMode === 'light' ? 'inherit' : 'whiteAlpha.900',
      _hover: {
        bg: colorMode === 'light' ? 'primary.500' : 'whiteAlpha.200',
      },
      _active: { bg: colorMode === 'light' ? 'primary.500' : 'whiteAlpha.300' },
      variant: 'ghost',
    };
  }

  return {
    color: colorMode === 'light' ? `${colorScheme}.600` : `${colorScheme}.200`,
    bg: 'transparent',
    _hover: {
      bg: colorMode === 'light' ? `${colorScheme}.50` : `${colorScheme}.100`,
    },
    _active: {
      bg: colorMode === 'light' ? `${colorScheme}.100` : `${colorScheme}.100`,
    },
    variant: 'ghost',
  };
};

export type { TNavbarIconButtonProps };
export { NavbarIconButton };
