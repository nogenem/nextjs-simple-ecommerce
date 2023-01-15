import type { StackProps, UseNumberInputProps } from '@chakra-ui/react';
import { Button, HStack, Input, useNumberInput } from '@chakra-ui/react';

type TNumberInputProps = UseNumberInputProps & {
  containerProps?: StackProps;
};

const NumberInput = ({ containerProps, ...rest }: TNumberInputProps) => {
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({ focusInputOnChange: false, ...rest });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const input = getInputProps();

  return (
    <HStack minW="10rem" {...containerProps}>
      <Button {...dec}>-</Button>
      <Input {...input} />
      <Button {...inc}>+</Button>
    </HStack>
  );
};

export type { TNumberInputProps };
export { NumberInput };
