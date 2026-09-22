import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  // Normalize line breaks and collapse excessive consecutive blank lines
  const sanitizedContent = (content || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none break-words leading-relaxed',
        'prose-headings:text-primary-text prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-6 prose-headings:mb-3 first:prose-headings:mt-0',
        'prose-p:text-secondary-text prose-p:my-2.5 prose-p:leading-relaxed',
        'prose-a:text-japan-red prose-a:font-medium hover:prose-a:underline',
        'prose-strong:text-primary-text prose-strong:font-semibold',
        'prose-ul:my-2 prose-ul:pl-5 prose-ol:my-2 prose-ol:pl-5',
        'prose-li:my-0.5 prose-li:text-secondary-text',
        'prose-blockquote:my-3 prose-blockquote:border-l-japan-red prose-blockquote:text-secondary-text prose-blockquote:pl-4 prose-blockquote:italic',
        'prose-code:text-primary-text prose-code:bg-secondary-bg prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:my-3 prose-pre:bg-primary-text prose-pre:text-off-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto',
        'prose-table:my-4 prose-th:p-2 prose-th:text-primary-text prose-td:p-2 prose-td:text-secondary-text prose-tr:border-b prose-tr:border-borders',
        'prose-hr:my-6 prose-hr:border-borders',
        className
      )}
    >
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
              {children}
            </a>
          ),
        }}
      >
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
}
