'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface Props {
  content: string
  streaming?: boolean
}

const components: Components = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-organa-text">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-organa-text-secondary">{children}</em>
  ),
  h2: ({ children }) => (
    <h2 className="font-bold text-[15px] text-organa-text mt-3 mb-1.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-semibold text-[14px] text-organa-text mt-2.5 mb-1 first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="my-1.5 space-y-1 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1.5 space-y-1 pl-1 list-decimal list-inside">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-[14px]">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-organa-accent flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <pre className="my-2 bg-gray-50 border border-organa-border rounded-lg px-3.5 py-3 overflow-x-auto">
          <code className="text-[12.5px] font-mono text-organa-text">{children}</code>
        </pre>
      )
    }
    return (
      <code className="bg-gray-100 text-organa-accent font-mono text-[12.5px] px-1.5 py-0.5 rounded-md">
        {children}
      </code>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-organa-accent pl-3 my-2 text-organa-text-secondary italic">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-lg border border-organa-border">
      <table className="w-full text-[13px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold text-organa-text bg-gray-50 border-b border-organa-border">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-organa-text-secondary border-b border-organa-border last:border-0">
      {children}
    </td>
  ),
  hr: () => <hr className="my-3 border-organa-border" />,
}

export default function MarkdownMessage({ content, streaming = false }: Props) {
  return (
    <div className="text-[14px] text-organa-text leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
      {streaming && (
        <span className="inline-block w-0.5 h-3.5 bg-organa-accent ml-0.5 align-middle animate-pulse" />
      )}
    </div>
  )
}
