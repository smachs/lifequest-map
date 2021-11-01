import { useEffect, useRef } from 'react';

function useDebounce<T>(value: T, action: (value: T) => void, timeout = 200) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      action(value);
    }, timeout);
    return () => clearTimeout(handle);
  }, [value]);
}

export default useDebounce;
