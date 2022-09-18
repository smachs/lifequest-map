import { useEffect, useState } from 'react';

function usePersistentState<T>(key: string, value: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : value;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;
