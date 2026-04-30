/**
 * Command-palette search modal — Algolia/Docusaurus-style.
 * Mounted globally; opens on Cmd/Ctrl+K and via the nav search button.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchAll, type SearchHit } from '../lib/search'

type Props = {
  open: boolean
  onClose: () => void
}

const CATEGORY_ORDER: SearchHit['category'][] = [
  'Episode',
  'Deliberation',
  'Methodology',
  'Rubric',
  'Plan',
  'Model',
  'Page',
]

export function SearchPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const hits = useMemo(() => searchAll(query, 18), [query])

  // Group hits by category, preserving the score order within each group
  const grouped = useMemo(() => {
    const map = new Map<SearchHit['category'], SearchHit[]>()
    for (const hit of hits) {
      const arr = map.get(hit.category) ?? []
      arr.push(hit)
      map.set(hit.category, arr)
    }
    return CATEGORY_ORDER
      .map(cat => ({ category: cat, items: map.get(cat) ?? [] }))
      .filter(group => group.items.length > 0)
  }, [hits])

  // Flat list mirroring the rendered order — keeps activeIndex aligned with DOM
  const flatHits = useMemo(() => grouped.flatMap(g => g.items), [grouped])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      // focus after the modal mounts
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }, [open])

  useEffect(() => { setActiveIndex(0) }, [query])

  // Lock scroll while open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Keep active item in view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-hit-idx="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open) return null

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, flatHits.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const hit = flatHits[activeIndex]
      if (hit) {
        navigate(hit.route)
        onClose()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="absolute inset-0 bg-[var(--backdrop-scrim)] backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[640px] bg-[color:var(--color-bg)] border border-[color:var(--color-ink)] rounded-xl shadow-[var(--shadow-card-lg)] overflow-hidden"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[color:var(--color-ink)]">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search episodes, deliberations, models…"
            className="flex-1 bg-transparent outline-none font-sans text-[17px] placeholder:text-[color:var(--color-ink-faint)]"
            aria-label="Search query"
          />
        </div>

        <div ref={listRef} className="search-scroll max-h-[60vh] overflow-y-auto">
          {flatHits.length === 0 ? (
            <div className="px-6 py-16 text-center text-[15px] text-[color:var(--color-ink-soft)]">
              No matches for <span className="font-mono text-[color:var(--color-ink)]">"{query}"</span>
            </div>
          ) : (
            grouped.map((group, gi) => (
              <div key={group.category} className={gi > 0 ? 'border-t border-[color:var(--color-rule)]' : ''}>
                <div className="px-6 pt-5 pb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">
                  {group.category}
                </div>
                <div className="flex flex-col pl-3 pr-4 pb-3">
                  {group.items.map(hit => {
                    const idx = flatHits.indexOf(hit)
                    const isActive = idx === activeIndex
                    return (
                      <button
                        key={hit.id}
                        data-hit-idx={idx}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => { navigate(hit.route); onClose() }}
                        className={[
                          'relative w-full text-left pl-6 pr-4 py-4 rounded-md flex items-center gap-3 transition-colors text-[color:var(--color-ink)]',
                          isActive
                            ? 'bg-[color:var(--color-bg-deep)]'
                            : 'hover:bg-[color:var(--color-bg-deep)]/55',
                        ].join(' ')}
                      >
                        <span className={[
                          'absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-sm transition-colors',
                          isActive ? 'bg-[color:var(--color-accent)]' : 'bg-transparent',
                        ].join(' ')} />
                        <div className="flex-1 min-w-0">
                          <div className="font-sans font-bold text-[15px] truncate">
                            <Highlight text={hit.title} query={query} />
                          </div>
                          {hit.subtitle && (
                            <div className="font-sans text-[13px] mt-1 truncate text-[color:var(--color-ink-soft)]">
                              {hit.subtitle}
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <kbd className="font-mono text-[10px] tracking-wider uppercase text-[color:var(--color-ink-soft)] border border-[color:var(--color-rule)] rounded px-1.5 py-0.5 bg-[color:var(--color-bg)]">
                            ↵
                          </kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-6 px-6 py-3 border-t border-[color:var(--color-rule)] font-mono text-[11px] text-[color:var(--color-ink-faint)] uppercase tracking-wider">
          <div className="flex items-center gap-5">
            <KeyHint label="↑↓" text="Nav" />
            <KeyHint label="↵" text="Open" />
          </div>
          <KeyHint label="ESC" text="Close" />
        </div>
      </div>
    </div>
  )
}

function Highlight({ text, query }: { text: string; query: string; active?: boolean }) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim())
  if (idx === -1) return <>{text}</>
  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + query.trim().length)
  const after = text.slice(idx + query.trim().length)
  return (
    <>
      {before}
      <span className="bg-[color:var(--color-hero-amber)] text-[color:var(--color-ink)] rounded-sm px-0.5">
        {match}
      </span>
      {after}
    </>
  )
}

function KeyHint({ label, text }: { label: string; text: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <kbd className="font-mono text-[11px] border border-[color:var(--color-rule)] rounded px-1.5 py-0.5 bg-[color:var(--color-bg)]">{label}</kbd>
      <span>{text}</span>
    </span>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-ink-soft)]">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
