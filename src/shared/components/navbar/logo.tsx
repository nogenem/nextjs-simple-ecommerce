import type { TMenuItemProps } from './menu-item';
import { MenuItem } from './menu-item';

type TLogoProps = Omit<TMenuItemProps, 'children'>;

const Logo = (props: TLogoProps) => {
  return (
    <MenuItem
      href="/"
      fontSize="lg"
      fontWeight="bold"
      highlightOnHref={false}
      {...props}
    >
      ECommerce
    </MenuItem>
  );
};

export type { TLogoProps };
export { Logo };
