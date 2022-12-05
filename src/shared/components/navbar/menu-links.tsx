import { Box, Stack } from '@chakra-ui/react';

import { CartButton } from './cart-button';
import { ToggleColorModeButton } from './toggle-color-mode-button';
import { UserMenu } from './user-menu';

type TMenuLinksProps = {
  isOpen: boolean;
};

const MenuLinks = ({ isOpen }: TMenuLinksProps) => {
  return (
    <Box
      display={{ base: isOpen ? 'block' : 'none', md: 'block' }}
      flexBasis={{ base: '100%', md: 'auto' }}
    >
      <Stack
        spacing={8}
        align="center"
        justify={['center', 'space-between', 'flex-end', 'flex-end']}
        direction={['column', 'row', 'row', 'row']}
        pt={[4, 4, 0, 0]}
      >
        <ToggleColorModeButton />
        <CartButton />
        <UserMenu />
      </Stack>
    </Box>
  );
};

export type { TMenuLinksProps };
export { MenuLinks };
