import { Box } from '@mantine/core';
import { Suspense, lazy, useEffect, useRef } from 'react';
const MarkdownToJSX = lazy(() => import('markdown-to-jsx'));

type MarkdownProps = {
  children: string;
};
function Markdown({ children }: MarkdownProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const links = containerRef.current?.querySelectorAll('a');
    if (links) {
      links.forEach((link) => (link.target = '_blank'));
    }
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      <Suspense>
        <MarkdownToJSX>{children}</MarkdownToJSX>
      </Suspense>
    </Box>
  );
}

export default Markdown;
