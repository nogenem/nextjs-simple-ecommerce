import React from 'react';

import { Logo } from './logo';
import { MenuLinks } from './menu-links';
import type { TNavbarContainerProps } from './navbar-container';
import { NavbarContainer } from './navbar-container';
import { ToggleNavbarMenuButton } from './toggle-navbar-menu-button';

type TNavbarProps = Omit<TNavbarContainerProps, 'children'>;

// https://www.jimraptis.com/blog/create-a-navbar-with-chakra-ui-react
const Navbar = (props: TNavbarProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <NavbarContainer {...props}>
      <Logo />
      <ToggleNavbarMenuButton toggle={toggle} isOpen={isOpen} />
      <MenuLinks isOpen={isOpen} />
    </NavbarContainer>
  );
};

export type { TNavbarProps };
export { Navbar };
