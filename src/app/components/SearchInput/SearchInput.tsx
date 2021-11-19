import type { InputHTMLAttributes } from 'react';
import SearchIcon from '../icons/SearchIcon';
import styles from './SearchInput.module.css';

type SearchInputProps = {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>;

function SearchInput({
  placeholder,
  value,
  onChange,
  ...inputProps
}: SearchInputProps) {
  return (
    <label className={styles.search}>
      <SearchIcon />
      <input
        {...inputProps}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export default SearchInput;
