import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import GauntletLogo from '../assets/gauntlet-logo.svg?react'
import { ThemeToggle } from './ThemeToggle'

type DropdownItem = {
  label: string
  to: string
  description?: string
}

type NavLink = {
  to: string
  label: string
  /** Omit for plain links (no caret, no dropdown). */
  dropdown?: DropdownItem[]
}

const links: NavLink[] = [
  {
    to: '/models',
    label: 'Models',
    dropdown: [
      { label: 'All Models', to: '/models', description: "Every model we've tested" },
      { label: 'Track A — Cold/Prompted', to: '/models?track=A', description: 'Strict prompt, low temp' },
      { label: 'Track B — Reasoning', to: '/models?track=B', description: 'Thinking-mode profiles' },
      { label: 'Compare Scores', to: '/leaderboard', description: 'Side-by-side leaderboard' },
    ],
  },
  {
    to: '/blog',
    label: 'Blog',
    dropdown: [
      { label: 'Episodes', to: '/blog#episodes', description: 'The narrative recaps' },
      { label: 'Deliberations', to: '/blog#deliberations', description: 'Day-by-day judging logs' },
      { label: 'Methodology', to: '/blog#methodology', description: 'How the gauntlet works' },
      { label: 'Latest', to: '/blog', description: 'Most recent posts' },
    ],
  },
  // Plain links — no dropdown
  { to: '/agentic', label: 'Agentic' },
  { to: '/rubrics', label: 'Rubrics' },
  { to: '/leaderboard', label: 'Leaderboard' },
]

export function Nav({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-[color:var(--color-bg)] border-b border-[color:var(--color-ink)]">
      <div className="max-w-none mx-auto px-4 md:px-8 flex items-center gap-12 min-h-[96px]">
        <Link to="/" className="flex items-center gap-3 shrink-0 group" aria-label="LLM Gauntlet — home">
          <GauntletLogo
            preserveAspectRatio="xMidYMid meet"
            className="h-[52px] w-auto text-[color:var(--color-ink)] transition-transform group-hover:scale-[1.04]"
          />
          <span className="font-mono font-semibold text-[17px] leading-tight tracking-[0.02em] uppercase text-[color:var(--color-ink)]">
            LLM<br />Gauntlet
          </span>
        </Link>

        <nav className="font-mono font-regular hidden md:flex flex-1 justify-center gap-[clamp(36px,5vw,88px)] h-[96px]">
          {links.map((link) => (
            <NavItem key={link.to} link={link} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search (Cmd/Ctrl+K)"
            className="flex items-center gap-2 h-10 pl-3 pr-2 rounded-md border border-[color:var(--color-rule)] hover:border-[color:var(--color-ink)] hover:bg-[color:var(--color-rule-soft)] transition-colors"
          >
            <SearchIcon />
            <span className="hidden sm:inline font-sans text-[13px] text-[color:var(--color-ink-faint)] mr-2">Search…</span>
            <kbd className="hidden sm:inline font-mono text-[11px] tracking-wider uppercase text-[color:var(--color-ink-soft)] border border-[color:var(--color-rule)] rounded px-1.5 py-0.5">⌘K</kbd>
          </button>
        </div>
      </div>
    </header>
  )
}

function NavItem({ link }: { link: NavLink }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(link.to)
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const hasDropdown = !!link.dropdown && link.dropdown.length > 0

  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 140)
  }
  function cancelClose() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  function show() { cancelClose(); setOpen(true) }

  useEffect(() => () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
  }, [])

  // Close when route changes
  useEffect(() => { setOpen(false) }, [location.pathname, location.hash])

  // Plain link — no dropdown machinery
  if (!hasDropdown) {
    return (
      <div className="relative flex items-center h-full">
        <Link
          to={link.to}
          className={[
            'font-mono text-[clamp(15px,1.45vw,21px)] tracking-[0.04em] uppercase font-medium px-1 h-full flex items-center transition-colors',
            isActive
              ? 'text-[color:var(--color-ink)] after:content-[""] after:absolute after:left-1 after:right-1 after:bottom-0 after:h-0.5 after:bg-[color:var(--color-ink)]'
              : 'text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]',
          ].join(' ')}
        >
          {link.label}
        </Link>
      </div>
    )
  }

  return (
    <div
      className="relative flex items-center h-full"
      onMouseEnter={show}
      onMouseLeave={scheduleClose}
    >
      <Link
        to={link.to}
        onClick={() => setOpen(false)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={[
          'font-mono text-[clamp(15px,1.45vw,21px)] tracking-[0.04em] uppercase font-medium px-1 h-full flex items-center gap-1.5 relative transition-colors',
          isActive
            ? 'text-[color:var(--color-ink)] after:content-[""] after:absolute after:left-1 after:right-1 after:bottom-0 after:h-0.5 after:bg-[color:var(--color-ink)]'
            : 'text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]',
        ].join(' ')}
      >
        {link.label}
        <Caret open={open} />
      </Link>

      {/* Dropdown */}
      <div
        role="menu"
        onMouseEnter={show}
        onMouseLeave={scheduleClose}
        className={[
          'absolute top-full left-1/2 -translate-x-1/2 w-[360px] z-50 transition-opacity duration-150',
          open ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
        ].join(' ')}
        // The 10px hover-bridge so the cursor can cross from trigger to menu
        style={{ paddingTop: 10 }}
      >
        <div className="bg-[color:var(--color-bg)] border border-[color:var(--color-ink)] rounded-md p-3 shadow-[var(--shadow-card)] flex flex-col gap-1">
          {link.dropdown!.map(item => (
            <Link
              key={item.to + item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="group/item flex flex-col gap-1.5 px-4 py-3.5 rounded-md hover:bg-[color:var(--color-rule-soft)] transition-colors"
            >
              <span className="font-mono text-[13px] uppercase tracking-[0.1em] font-semibold text-[color:var(--color-ink)]">
                {item.label}
              </span>
              {item.description && (
                <span className="font-sans text-[12.5px] leading-snug text-[color:var(--color-ink-soft)] normal-case tracking-normal">
                  {item.description}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['transition-transform duration-150 opacity-60', open ? 'rotate-180' : ''].join(' ')}
      aria-hidden="true"
    >
      <polyline points="2,4 5,7 8,4" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-ink-soft)]">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
