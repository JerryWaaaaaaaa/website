type MarkdownProps = {
  html: string;
  className?: string;
};

export function Markdown({ html, className = '' }: MarkdownProps) {
  return (
    <div
      className={`sg-prose ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
