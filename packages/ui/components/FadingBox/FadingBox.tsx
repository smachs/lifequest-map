import { Box } from '@mantine/core';
import type { ReactNode } from 'react';
import { isEmbed } from '../../utils/routes';
import { useSettingsStore } from '../../utils/settingsStore';
import useActive from './useActive';

type FadingBoxProps = {
  left?: number | string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  zIndex?: number;
  children: ReactNode;
  fadeFrom: 'top' | 'right' | 'left' | 'bottom';
  className?: string;
};

const FadingBox = ({
  children,
  zIndex = 1,
  fadeFrom,
  className,
  ...props
}: FadingBoxProps) => {
  const active = useActive();
  const autoFade = useSettingsStore((state) => state.autoFade);
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
        !isEmbed && !active && autoFade
          ? {
              [fadeFrom]: '-120px',
              transitionDelay: '1.5s',
            }
          : {}
      }
      className={className}
    >
      {children}
    </Box>
  );
};

export default FadingBox;
