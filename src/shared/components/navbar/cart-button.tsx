import { MdOutlineShoppingCart } from 'react-icons/md';

import NextLink from 'next/link';

import { Badge, Icon, Link } from '@chakra-ui/react';

import { useSumCartItemsQuantities } from '~/features/cart/hooks';

import { NavbarIconButton } from './navbar-icon-button';

const CartButton = () => {
  const { sum: sumCartItemsQuantities } = useSumCartItemsQuantities();

  const variantsInCartTxt =
    sumCartItemsQuantities > 99 ? '99+' : `${sumCartItemsQuantities}`;
  const badgeFontSize = sumCartItemsQuantities > 99 ? 9 : 11;

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
        {sumCartItemsQuantities > 0 && (
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
