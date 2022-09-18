import MarkdownToJSX from 'markdown-to-jsx';
import { useEffect, useRef } from 'react';

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
    <div ref={containerRef}>
      <MarkdownToJSX>{children}</MarkdownToJSX>
    </div>
  );
}

export default Markdown;
