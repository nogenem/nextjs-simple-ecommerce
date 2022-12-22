import { MdOutlineShoppingCart } from 'react-icons/md';

import NextLink from 'next/link';

import { Badge, Icon, Link } from '@chakra-ui/react';

import { useSumCartQuantities } from '~/features/cart/hooks';

import { NavbarIconButton } from './navbar-icon-button';

const CartButton = () => {
  const variantsInCart = useSumCartQuantities();

  const variantsInCartValue = variantsInCart.data || 0;
  const variantsInCartTxt =
    variantsInCartValue > 99 ? '99+' : `${variantsInCartValue}`;
  const badgeFontSize = variantsInCartValue > 99 ? 9 : 11;

  return (
    <NextLink href="/cart" passHref legacyBehavior>
      <Link
        sx={{
          position: 'relative',
        }}
      >
        <NavbarIconButton
          icon={<Icon boxSize="1.5rem" as={MdOutlineShoppingCart} />}
          aria-label="Go to the Cart page"
          tabIndex={-1}
        />
        {variantsInCartValue > 0 && (
          <Badge
            colorScheme="secondary"
            sx={{
              position: 'absolute',
              top: 0,
              right: '-6px',
              pointerEvents: 'none',
            }}
            rounded="full"
            fontSize={badgeFontSize}
          >
            {variantsInCartTxt}
          </Badge>
        )}
      </Link>
    </NextLink>
  );
};

export { CartButton };
