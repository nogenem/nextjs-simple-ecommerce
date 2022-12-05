import { MdOutlineShoppingCart } from 'react-icons/md';

import NextLink from 'next/link';

import { Badge, Icon, Link } from '@chakra-ui/react';

import { NavbarIconButton } from './navbar-icon-button';

const CartButton = () => {
  // TODO: Get data from the real cart
  const productsInCart = 10;
  const productsInCartTxt = productsInCart > 99 ? '99+' : `${productsInCart}`;
  const badgeFontSize = productsInCart > 99 ? 9 : 11;

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
          {productsInCartTxt}
        </Badge>
      </Link>
    </NextLink>
  );
};

export { CartButton };
