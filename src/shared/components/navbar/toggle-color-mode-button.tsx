import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md';

import { Icon, useColorMode } from '@chakra-ui/react';

import { NavbarIconButton } from './navbar-icon-button';

const ToggleColorModeButton = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const label =
    colorMode === 'light'
      ? 'Change to Dark color mode'
      : 'Change to Light color mode';

  const icon = (
    <Icon
      boxSize="1.5rem"
      as={colorMode === 'light' ? MdOutlineDarkMode : MdOutlineLightMode}
    />
  );

  return (
    <NavbarIconButton
      onClick={toggleColorMode}
      icon={icon}
      aria-label={label}
    />
  );
};

export { ToggleColorModeButton };
