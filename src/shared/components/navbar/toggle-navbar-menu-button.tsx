import { MdClose, MdMenu } from 'react-icons/md';

import { Icon } from '@chakra-ui/react';

import { NavbarIconButton } from './navbar-icon-button';

type TToggleNavbarMenuButtonProps = {
  isOpen: boolean;
  toggle: () => void;
};

const ToggleNavbarMenuButton = ({
  isOpen,
  toggle,
}: TToggleNavbarMenuButtonProps) => {
  const label = isOpen ? 'Close navbar menu' : 'Open navbar menu';

  return (
    <NavbarIconButton
      display={{ base: 'flex', md: 'none' }}
      onClick={toggle}
      aria-label={label}
      icon={
        isOpen ? (
          <Icon boxSize="1.5rem" as={MdClose} />
        ) : (
          <Icon boxSize="1.5rem" as={MdMenu} />
        )
      }
    />
  );
};

export type { TToggleNavbarMenuButtonProps };
export { ToggleNavbarMenuButton };
