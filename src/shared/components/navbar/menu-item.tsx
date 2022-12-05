import React from 'react';

import NextLink from 'next/link';
import { useRouter } from 'next/router';

import type { TextProps } from '@chakra-ui/react';
import { Link, Text } from '@chakra-ui/react';

type TMenuItemProps = TextProps & {
  children: React.ReactNode;
  href?: string;
  highlightOnHref?: boolean;
};

const MenuItem = ({
  children,
  href = '/',
  highlightOnHref = true,
  ...rest
}: TMenuItemProps) => {
  const router = useRouter();

  const textDecor =
    highlightOnHref && router.route === href ? 'underline' : 'unset';

  return (
    <NextLink href={href} passHref legacyBehavior>
      <Link textDecor={textDecor}>
        <Text display="block" {...rest}>
          {children}
        </Text>
      </Link>
    </NextLink>
  );
};

export type { TMenuItemProps };
export { MenuItem };
