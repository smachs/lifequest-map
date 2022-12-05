import { useEffect, useState } from 'react';

const useActive = () => {
  const [active, setActive] = useState(true);

  useEffect(() => {
    if ('ontouchstart' in window) {
      let timeoutId = setTimeout(() => {
        setActive(false);
      }, 4500);
      const onTouchStart = () => {
        setActive(true);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setActive(false);
        }, 4500);
      };

      document.documentElement.addEventListener('touchstart', onTouchStart);

      return () => {
        document.documentElement.removeEventListener(
          'touchstart',
          onTouchStart
        );
        clearTimeout(timeoutId);
      };
    }

    const onPageLeave = () => {
      setActive(false);
    };
    const onPageEnter = () => {
      setActive(true);
    };
    document.documentElement.addEventListener('mouseleave', onPageLeave);
    document.documentElement.addEventListener('mouseenter', onPageEnter);

    return () => {
      document.documentElement.removeEventListener('mouseleave', onPageLeave);
      document.documentElement.removeEventListener('mouseenter', onPageEnter);
    };
  }, []);

  return active;
};

export default useActive;
