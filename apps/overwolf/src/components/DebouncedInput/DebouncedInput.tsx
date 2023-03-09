import type { TextInputProps } from '@mantine/core';
import { TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';

type DebouncedInputProps = {
  value?: string;
  onChange: (value: string) => void;
} & Omit<TextInputProps, 'onChange' | 'value'>;
const DebouncedInput = ({
  value = '',
  onChange,
  ...props
}: DebouncedInputProps) => {
  const [internalValue, setInternalValue] = useState(value);
  const [debounced] = useDebouncedValue(internalValue, 250);

  useEffect(() => {
    if (debounced) {
      onChange(debounced);
    }
  }, [debounced]);

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
    }
  }, [value]);

  return (
    <TextInput
      {...props}
      value={internalValue}
      onChange={(event) => setInternalValue(event.target.value)}
    />
  );
};

export default DebouncedInput;
