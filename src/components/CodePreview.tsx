'use client'

import { useState } from 'react'

interface CodePreviewProps {
  code: string
  language: string
  maxLines?: number
}

export default function CodePreview({ code, language, maxLines = 25 }: CodePreviewProps) {
  const [expanded, setExpanded] = useState(false)

  const lines = code.split('\n')
  const displayLines = expanded ? lines : lines.slice(0, maxLines)
  const hasMore = lines.length > maxLines

  // Simple syntax highlighting for Solidity
  const highlightLine = (line: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let remaining = line
    let key = 0

    // Comments
    if (remaining.trimStart().startsWith('//') || remaining.trimStart().startsWith('*') || remaining.trimStart().startsWith('/*')) {
      return <span key={key} className="text-gray-500">{line}</span>
    }

    // Keywords
    const keywords = ['pragma', 'solidity', 'import', 'contract', 'interface', 'library', 'function', 'constructor',
      'modifier', 'event', 'struct', 'enum', 'mapping', 'public', 'private', 'internal', 'external',
      'view', 'pure', 'payable', 'virtual', 'override', 'returns', 'require', 'emit', 'if', 'else',
      'for', 'while', 'return', 'break', 'continue', 'new', 'delete', 'is', 'using', 'memory',
      'storage', 'calldata', 'immutable', 'constant']

    // Tokenize roughly
    const regex = /(\b[\w]+\b|"[^"]*"|'[^']*'|\d+|[{}()[\];,.<>=!+\-*/&|^~%?@])/g
    let match
    while ((match = regex.exec(remaining)) !== null) {
      const token = match[0]
      const before = remaining.slice(0, match.index)
      if (before) parts.push(<span key={key++}>{before}</span>)

      if (keywords.includes(token)) {
        parts.push(<span key={key++} className="text-blue-400">{token}</span>)
      } else if (/^\d+$/.test(token)) {
        parts.push(<span key={key++} className="text-amber-400">{token}</span>)
      } else if (/^["']/.test(token)) {
        parts.push(<span key={key++} className="text-green-400">{token}</span>)
      } else if (['true', 'false', 'address', 'uint256', 'uint112', 'uint32', 'uint', 'int',
        'bool', 'string', 'bytes32', 'bytes4', 'bytes', 'msg', 'block', 'tx', 'type',
        'this', 'super', 'Math'].includes(token)) {
        parts.push(<span key={key++} className="text-cyan-400">{token}</span>)
      } else {
        parts.push(<span key={key++}>{token}</span>)
      }
      remaining = remaining.slice(match.index + token.length)
    }
    if (remaining) parts.push(<span key={key++}>{remaining}</span>)

    return <>{parts}</>
  }

  return (
    <div className="bg-[#0d0d14] overflow-x-auto">
      <pre className="p-4 text-sm font-mono leading-relaxed">
        {displayLines.map((line, i) => (
          <div key={i} className="flex">
            <span className="text-gray-600 w-12 text-right pr-4 select-none shrink-0">
              {i + 1}
            </span>
            <span className="text-gray-300">
              {highlightLine(line)}
            </span>
          </div>
        ))}
      </pre>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-center text-sm text-accent-primary hover:text-accent-secondary border-t border-gray-800/50 transition-colors"
        >
          {expanded ? '▲ Collapse' : `▼ Show all ${lines.length} lines`}
        </button>
      )}
    </div>
  )
}
