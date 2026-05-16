import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PublicLayout } from '@/components/layout'
import { CodeBlock } from './components/code-block'
import { DocsSidebar } from './components/docs-sidebar'

const MODELS = [
  { name: 'deepseek-chat', context: '64K', badge: null, desc: 'General tasks, coding, analysis' },
  { name: 'deepseek-reasoner', context: '64K', badge: null, desc: 'Step-by-step reasoning, math' },
  { name: 'glm-4-flash', context: '128K', badge: 'Free', desc: 'Fast, free tier' },
  { name: 'glm-4.7', context: '128K', badge: null, desc: 'Balanced performance' },
  { name: 'kimi-k2.5', context: '200K', badge: null, desc: 'Long documents, deep research' },
  { name: 'kimi-k2.6', context: '200K', badge: null, desc: 'Latest Kimi, best quality' },
]

const CURL_EXAMPLE = `curl https://apibay.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $APIBAY_API_KEY" \\
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "user", "content": "Hello! What can you do?"}
    ],
    "stream": false
  }'`

const PYTHON_EXAMPLE = `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://apibay.ai/v1"
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello! What can you do?"}
    ]
)

print(response.choices[0].message.content)`

const NODE_EXAMPLE = `import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://apibay.ai/v1'
})

const response = await client.chat.completions.create({
  model: 'deepseek-chat',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello! What can you do?' }
  ]
})

console.log(response.choices[0].message.content)`

const CLAUDE_CODE_EXAMPLE = `# Set APiBay as your API provider
export ANTHROPIC_API_KEY="YOUR_API_KEY"
export ANTHROPIC_BASE_URL="https://apibay.ai"

# Or configure directly in Claude Code
claude config set --global api.url https://apibay.ai
claude config set --global api.key YOUR_API_KEY`

const STREAM_EXAMPLE = `curl https://apibay.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $APIBAY_API_KEY" \\
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Tell me a story"}],
    "stream": true
  }'`

const MODELS_LIST_EXAMPLE = `curl https://apibay.ai/v1/models \\
  -H "Authorization: Bearer $APIBAY_API_KEY"`

export function Docs() {
  const [activeId, setActiveId] = useState('introduction')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const ref = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el
  }

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveId(id)
  }

  return (
    <PublicLayout>
      <div className='mx-auto max-w-6xl px-4 py-12'>
        {/* Page header */}
        <div className='mb-10'>
          <h1 className='text-3xl font-bold tracking-tight'>Documentation</h1>
          <p className='text-muted-foreground mt-2'>
            Everything you need to start calling AI models through APiBay.
          </p>
        </div>

        <div className='flex gap-12'>
          {/* Left sidebar */}
          <DocsSidebar activeId={activeId} onSelect={scrollTo} />

          {/* Main content */}
          <div className='min-w-0 flex-1 space-y-16'>

            {/* Introduction */}
            <section id='introduction' ref={ref('introduction')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>Introduction</h2>
              <Separator />
              <p className='text-muted-foreground leading-relaxed'>
                APiBay is a unified AI API gateway. With a single API key and a single base URL,
                you get access to DeepSeek, GLM, Kimi, Claude, and more — all through the same
                OpenAI-compatible interface.
              </p>
              <div className='grid gap-3 sm:grid-cols-3'>
                {[
                  { title: 'OpenAI-Compatible', desc: 'Drop-in replacement. Change baseURL, keep your existing code.' },
                  { title: 'Crypto + Card', desc: 'Pay with USDT, USDC, or Stripe. No bank account required.' },
                  { title: '10+ Models', desc: 'DeepSeek, GLM, Kimi and more. One key for all.' },
                ].map((f) => (
                  <div key={f.title} className='rounded-lg border p-4'>
                    <p className='font-semibold'>{f.title}</p>
                    <p className='text-muted-foreground mt-1 text-sm'>{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Start */}
            <section id='quick-start' ref={ref('quick-start')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>Quick Start</h2>
              <Separator />
              <ol className='space-y-4'>
                {[
                  { step: '1', title: 'Create an account', desc: (<>Go to <Link to='/sign-up' className='text-primary underline underline-offset-2'>apibay.ai/sign-up</Link> and register.</>)},
                  { step: '2', title: 'Top up your balance', desc: 'Minimum $5. Supports USDT, USDC, and Stripe credit card.' },
                  { step: '3', title: 'Get your API key', desc: 'Console → Token Management → Create Token. Copy the key.' },
                  { step: '4', title: 'Make your first call', desc: 'Use the curl example below or any OpenAI-compatible SDK.' },
                ].map((item) => (
                  <li key={item.step} className='flex gap-4'>
                    <span className='bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold'>
                      {item.step}
                    </span>
                    <div>
                      <p className='font-semibold'>{item.title}</p>
                      <p className='text-muted-foreground mt-0.5 text-sm'>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <CodeBlock code={CURL_EXAMPLE} language='bash' />
            </section>

            {/* Authentication */}
            <section id='authentication' ref={ref('authentication')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>Authentication</h2>
              <Separator />
              <p className='text-muted-foreground leading-relaxed'>
                All API requests require a Bearer token in the <code className='bg-muted rounded px-1.5 py-0.5 text-sm font-mono'>Authorization</code> header.
              </p>
              <CodeBlock
                code={`Authorization: Bearer YOUR_API_KEY`}
                language='http'
              />
              <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800'>
                <strong>Keep your key secret.</strong> Never expose it in client-side code or public repositories.
                Rotate it immediately in Console → Token Management if compromised.
              </div>
            </section>

            {/* Base URL */}
            <section id='base-url' ref={ref('base-url')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>Base URL</h2>
              <Separator />
              <p className='text-muted-foreground leading-relaxed'>
                All requests go to a single endpoint. It is fully compatible with the OpenAI API specification.
              </p>
              <CodeBlock code='https://apibay.ai/v1' language='url' />
            </section>

            {/* Chat Completions */}
            <section id='chat-completions' ref={ref('chat-completions')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>Chat Completions</h2>
              <Separator />
              <p className='text-muted-foreground'>
                The primary endpoint. Supports streaming, system prompts, and multi-turn conversations.
              </p>
              <div className='rounded-lg border p-3 font-mono text-sm'>
                <span className='rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700'>POST</span>
                <span className='ml-2'>/v1/chat/completions</span>
              </div>
              <div className='overflow-hidden rounded-lg border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50'>
                    <tr>
                      <th className='px-4 py-2 text-left font-semibold'>Parameter</th>
                      <th className='px-4 py-2 text-left font-semibold'>Type</th>
                      <th className='px-4 py-2 text-left font-semibold'>Required</th>
                      <th className='px-4 py-2 text-left font-semibold'>Description</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {[
                      { param: 'model', type: 'string', req: 'Yes', desc: 'Model ID, e.g. deepseek-chat' },
                      { param: 'messages', type: 'array', req: 'Yes', desc: 'Array of {role, content} objects' },
                      { param: 'stream', type: 'boolean', req: 'No', desc: 'Enable streaming (SSE). Default: false' },
                      { param: 'temperature', type: 'number', req: 'No', desc: 'Sampling temperature 0–2. Default: 1' },
                      { param: 'max_tokens', type: 'integer', req: 'No', desc: 'Maximum tokens in the response' },
                    ].map((row) => (
                      <tr key={row.param} className='hover:bg-muted/30'>
                        <td className='px-4 py-2 font-mono text-xs'>{row.param}</td>
                        <td className='text-muted-foreground px-4 py-2 font-mono text-xs'>{row.type}</td>
                        <td className='px-4 py-2'>
                          {row.req === 'Yes'
                            ? <Badge variant='destructive' className='text-xs'>Required</Badge>
                            : <Badge variant='secondary' className='text-xs'>Optional</Badge>}
                        </td>
                        <td className='text-muted-foreground px-4 py-2 text-xs'>{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className='font-semibold'>Streaming example</h3>
              <CodeBlock code={STREAM_EXAMPLE} language='bash' />
            </section>

            {/* List Models */}
            <section id='models-list' ref={ref('models-list')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>List Models</h2>
              <Separator />
              <div className='rounded-lg border p-3 font-mono text-sm'>
                <span className='rounded bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-700'>GET</span>
                <span className='ml-2'>/v1/models</span>
              </div>
              <CodeBlock code={MODELS_LIST_EXAMPLE} language='bash' />
            </section>

            {/* Python SDK */}
            <section id='openai-sdk' ref={ref('openai-sdk')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>OpenAI SDK — Python</h2>
              <Separator />
              <p className='text-muted-foreground'>
                Install the official OpenAI Python library and point it at APiBay.
              </p>
              <CodeBlock code='pip install openai' language='bash' />
              <CodeBlock code={PYTHON_EXAMPLE} language='python' />
            </section>

            {/* Node SDK */}
            <section id='node-sdk' ref={ref('node-sdk')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>OpenAI SDK — Node.js</h2>
              <Separator />
              <CodeBlock code='npm install openai' language='bash' />
              <CodeBlock code={NODE_EXAMPLE} language='javascript' />
            </section>

            {/* Claude Code */}
            <section id='claude-code' ref={ref('claude-code')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>Claude Code</h2>
              <Separator />
              <p className='text-muted-foreground leading-relaxed'>
                APiBay works as a drop-in backend for Claude Code. Point it at our endpoint to use
                DeepSeek, GLM, or Kimi through the same CLI you know.
              </p>
              <CodeBlock code={CLAUDE_CODE_EXAMPLE} language='bash' />
              <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800'>
                Claude models require an active Claude upstream channel.{' '}
                <a
                  href='https://apibay.ai/pricing'
                  className='underline underline-offset-2'
                >
                  Check availability on the pricing page.
                </a>
              </div>
            </section>

            {/* Available Models */}
            <section id='available-models' ref={ref('available-models')} className='scroll-mt-24 space-y-4'>
              <h2 className='text-2xl font-bold'>Available Models</h2>
              <Separator />
              <div className='overflow-hidden rounded-lg border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50'>
                    <tr>
                      <th className='px-4 py-3 text-left font-semibold'>Model ID</th>
                      <th className='px-4 py-3 text-left font-semibold'>Context</th>
                      <th className='px-4 py-3 text-left font-semibold'>Best For</th>
                      <th className='px-4 py-3 text-left font-semibold'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {MODELS.map((m) => (
                      <tr key={m.name} className='hover:bg-muted/30'>
                        <td className='px-4 py-3 font-mono text-xs'>{m.name}</td>
                        <td className='text-muted-foreground px-4 py-3'>{m.context}</td>
                        <td className='text-muted-foreground px-4 py-3 text-xs'>{m.desc}</td>
                        <td className='px-4 py-3'>
                          {m.badge === 'Free' && (
                            <Badge className='bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs'>Free</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className='text-muted-foreground text-sm'>
                Full pricing details on the{' '}
                <Link to='/pricing' className='text-primary underline underline-offset-2'>
                  pricing page
                </Link>
                .
              </p>
            </section>

            {/* Footer CTA */}
            <div className='rounded-xl border bg-gradient-to-br from-slate-50 to-blue-50 p-8 text-center'>
              <h3 className='text-xl font-bold'>Ready to build?</h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                Sign up in 30 seconds. No credit card required to start.
              </p>
              <div className='mt-4 flex justify-center gap-3'>
                <Link
                  to='/sign-up'
                  className='bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90'
                >
                  Get Started Free
                </Link>
                <Link
                  to='/pricing'
                  className='border rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent'
                >
                  View Pricing
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
