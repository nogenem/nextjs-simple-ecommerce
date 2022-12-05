import { signIn, signOut, useSession } from 'next-auth/react';

import {
  Avatar,
  Box,
  Button,
  Center,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorModeValue,
} from '@chakra-ui/react';

const UserMenu = () => {
  const { data: session } = useSession();
  const color = useColorModeValue('primary.500', 'white');

  const userName = session?.user?.name || 'John Doe';
  const userImg = session?.user?.image || undefined;

  return (
    <Box>
      <Menu>
        <MenuButton
          as={Button}
          rounded="full"
          variant="link"
          cursor="pointer"
          minW={0}
          h={8}
        >
          <Avatar size="sm" src={userImg} />
        </MenuButton>
        <MenuList alignItems="center" color={color}>
          {!session && <DefaultUserMenuItems />}
          {session && (
            <LoggedInUserMenuItems userName={userName} userImg={userImg} />
          )}
        </MenuList>
      </Menu>
    </Box>
  );
};

const DefaultUserMenuItems = () => {
  return (
    <>
      <MenuItem onClick={() => signIn('google')}>Login</MenuItem>
    </>
  );
};

const LoggedInUserMenuItems = ({
  userName,
  userImg,
}: {
  userName: string;
  userImg?: string;
}) => {
  return (
    <>
      <br />
      <Center>
        <Avatar size="2xl" src={userImg} />
      </Center>
      <br />
      <Center>
        <p>{userName}</p>
      </Center>
      <br />
      <MenuDivider />
      <MenuItem onClick={() => signOut()}>Logout</MenuItem>
    </>
  );
};

export { UserMenu };
