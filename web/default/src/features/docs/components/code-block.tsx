import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('group relative rounded-lg border bg-zinc-950 text-zinc-100', className)}>
      {language && (
        <div className='flex items-center justify-between border-b border-zinc-800 px-4 py-2'>
          <span className='text-xs text-zinc-400'>{language}</span>
          <button
            onClick={handleCopy}
            className='flex items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200'
          >
            {copied ? <Check className='h-3.5 w-3.5' /> : <Copy className='h-3.5 w-3.5' />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      <pre className='overflow-x-auto p-4 text-sm leading-relaxed'>
        <code>{code}</code>
      </pre>
    </div>
  )
}
