import { Box } from '@mantine/core';
import type { ReactNode } from 'react';
import useActive from './useActive';

type FadingBoxProps = {
  left?: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  zIndex?: number;
  children: ReactNode;
  fadeFrom: 'top' | 'right' | 'left' | 'bottom';
};

const FadingBox = ({
  children,
  zIndex = 1,
  fadeFrom,
  ...props
}: FadingBoxProps) => {
  const active = useActive();
  return (
    <Box
      sx={{
        transition: '0.5s all',
        transitionDelay: '0s',
        position: 'fixed',
        zIndex,
        ...props,
      }}
      style={
        !active
          ? {
              [fadeFrom]: '-120px',
              transitionDelay: '1.5s',
            }
          : {}
      }
    >
      {children}
    </Box>
  );
};

export default FadingBox;
