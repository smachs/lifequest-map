import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';

type DebouncedInputProps = {
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};
const DebouncedInput = ({
  value = '',
  placeholder,
  onChange,
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
    <input
      value={internalValue}
      placeholder={placeholder}
      onChange={(event) => setInternalValue(event.target.value)}
    />
  );
};

export default DebouncedInput;
