import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'quick-start', label: 'Quick Start' },
      { id: 'authentication', label: 'Authentication' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { id: 'base-url', label: 'Base URL' },
      { id: 'chat-completions', label: 'Chat Completions' },
      { id: 'models-list', label: 'List Models' },
    ],
  },
  {
    title: 'SDKs & Integrations',
    items: [
      { id: 'openai-sdk', label: 'OpenAI SDK (Python)' },
      { id: 'node-sdk', label: 'OpenAI SDK (Node.js)' },
      { id: 'claude-code', label: 'Claude Code' },
    ],
  },
  {
    title: 'Models',
    items: [
      { id: 'available-models', label: 'Available Models' },
    ],
  },
]

interface DocsSidebarProps {
  activeId: string
  onSelect: (id: string) => void
}

export function DocsSidebar({ activeId, onSelect }: DocsSidebarProps) {
  return (
    <nav className='w-56 shrink-0'>
      <div className='sticky top-24 space-y-6'>
        {NAV.map((section) => (
          <div key={section.title}>
            <p className='mb-2 px-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
              {section.title}
            </p>
            <ul className='space-y-0.5'>
              {section.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      'w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                      activeId === item.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}
