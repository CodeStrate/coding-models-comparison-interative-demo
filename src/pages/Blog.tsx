import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { docsByType, type Doc } from '../lib/content'

type Section = 'all' | 'episodes' | 'deliberations' | 'methodology'

const SECTIONS: Array<{ id: Section; label: string; blurb: string }> = [
  { id: 'all', label: 'Latest', blurb: 'Everything, newest first' },
  { id: 'episodes', label: 'Episodes', blurb: 'The narrative recaps' },
  { id: 'deliberations', label: 'Deliberations', blurb: 'Day-by-day judging logs' },
  { id: 'methodology', label: 'Methodology', blurb: 'How the gauntlet works' },
]

function formatSnappyTitle(title: string): string {
  let s = title.replace(/^LLM Arena V2\.2:\s*/i, '')
  s = s.replace(/^LLM Arena V2\.1:\s*/i, '')
  s = s.replace(/Deliberation\s*/i, '')

  if (s.toLowerCase().includes('sushi retry, gemma thinking retry')) return 'Sushi & Gemma Redemptions'
  if (s.toLowerCase().includes('tuned runs, agentic redemptions')) return 'Tuned Runs & Serialization Trap'
  if (s.toLowerCase().includes('benchmark extraction, scoring cleanup')) return 'Scoring Cleanup & OSS High Review'
  if (s.toLowerCase().includes('codestral retired, gemma approved')) return 'Codestral Retired, Gemma Approved'
  if (s.toLowerCase().includes('oss high - track b retest')) return 'OSS High: Track B Retest'
  if (s.toLowerCase().includes('prompt design, track splits')) return 'Prompt Design & Track Splits'
  if (s.toLowerCase().includes('methodology & model judgement')) return 'Methodology & Judgement Alg'

  return s
}

function cleanExcerpt(excerpt: string) {
  return excerpt.replace(/\*\*/g, '').replace(/\[\[(.*?)\]\]/g, '$1')
}

function readTime(excerpt: string | undefined): string {
  const len = excerpt?.length ?? 0
  if (len < 80) return '4 min read'
  if (len < 200) return '6 min read'
  return '9 min read'
}

function routeForDoc(doc: Doc): string {
  if (doc.type === 'episode') return `/blog/${doc.slug}`
  if (doc.type === 'deliberation' || doc.type === 'retest') return `/deliberations/${doc.slug}`
  return `/docs/${doc.slug}`
}

function eyebrowFor(doc: Doc): string {
  if (doc.type === 'episode') return doc.episodeNumber != null ? `EPISODE ${doc.episodeNumber}` : 'INTERLUDE'
  if (doc.type === 'deliberation' || doc.type === 'retest') return 'DELIBERATION'
  return doc.type.toUpperCase()
}

export function Blog() {
  const location = useLocation()
  const initial = (location.hash.replace('#', '') as Section) || 'all'
  const [section, setSection] = useState<Section>(
    SECTIONS.some(s => s.id === initial) ? initial : 'all',
  )

  useEffect(() => {
    const hash = location.hash.replace('#', '') as Section
    if (SECTIONS.some(s => s.id === hash)) setSection(hash)
  }, [location.hash])

  const episodes = useMemo(
    () => docsByType('episode').sort((a, b) => (a.episodeNumber ?? 99) - (b.episodeNumber ?? 99)),
    [],
  )
  const deliberations = useMemo(() => docsByType('deliberation'), [])
  const methodology = useMemo(
    () => [...docsByType('methodology'), ...docsByType('rubric'), ...docsByType('plan'), ...docsByType('gauntlet')],
    [],
  )

  const featured = episodes[episodes.length - 1] ?? episodes[0]

  const visible = useMemo(() => {
    if (section === 'episodes') return episodes
    if (section === 'deliberations') return deliberations
    if (section === 'methodology') return methodology
    return [...deliberations, ...episodes, ...methodology]
  }, [section, episodes, deliberations, methodology])

  const showFeatured = (section === 'all' || section === 'episodes') && featured

  return (
    <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,72px)] py-16">
      {/* Page header — give it real air */}
      <header className="pb-14 mb-20 border-b border-[color:var(--color-rule)]">
        <div className="inline-flex items-center font-mono text-[12px] tracking-[0.16em] uppercase border border-[color:var(--color-ink)] rounded-sm px-2.5 py-1 mb-8">
          The Blog
        </div>
        <h1 className="font-sans text-[clamp(40px,5.5vw,72px)] font-bold leading-[1.05] tracking-tight max-w-4xl">
          Field reports from the gauntlet.
        </h1>
        <p className="mt-6 font-sans text-[18px] text-[color:var(--color-ink-soft)] max-w-2xl leading-relaxed">
          Episodes, deliberations, and methodology notes from April of testing open-source coding models against
          backend tasks that actually break things.
        </p>
      </header>

      {/* Featured */}
      {showFeatured && <FeaturedArticle doc={featured} />}

      <div className="grid lg:grid-cols-[240px_1fr] gap-12 lg:gap-24">
        {/* Sidebar nav */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)] mb-5">
            Browse
          </div>
          <nav aria-label="Blog sections" className="flex flex-col gap-1 mb-12">
            {SECTIONS.map(s => {
              const isActive = section === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSection(s.id)}
                  className={[
                    'group w-full text-left flex items-center gap-4 px-4 py-4 rounded-md transition-colors',
                    isActive
                      ? 'bg-[color:var(--color-rule-soft)]'
                      : 'hover:bg-[color:var(--color-rule-soft)]/60',
                  ].join(' ')}
                >
                  <span className={[
                    'inline-block w-[3px] h-7 rounded-sm transition-colors',
                    isActive ? 'bg-[color:var(--color-ink)]' : 'bg-transparent group-hover:bg-[color:var(--color-ink-faint)]',
                  ].join(' ')} />
                  <span className="flex-1">
                    <span className={[
                      'block font-sans text-[15px] leading-tight',
                      isActive ? 'font-bold text-[color:var(--color-ink)]' : 'font-semibold text-[color:var(--color-ink)]',
                    ].join(' ')}>{s.label}</span>
                    <span className="block font-sans text-[12.5px] mt-1 leading-snug text-[color:var(--color-ink-soft)]">
                      {s.blurb}
                    </span>
                  </span>
                </button>
              )
            })}
          </nav>

          <div className="px-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)] mb-3">
              Counts
            </div>
            <ul className="font-sans text-[14px] text-[color:var(--color-ink-soft)] space-y-2">
              <li className="flex justify-between"><span>Episodes</span><span className="font-mono text-[color:var(--color-ink)]">{episodes.length}</span></li>
              <li className="flex justify-between"><span>Deliberations</span><span className="font-mono text-[color:var(--color-ink)]">{deliberations.length}</span></li>
              <li className="flex justify-between"><span>Methodology</span><span className="font-mono text-[color:var(--color-ink)]">{methodology.length}</span></li>
            </ul>
          </div>
        </aside>

        {/* Article list */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between mb-12">
            <h2 className="font-sans text-[32px] font-bold tracking-tight">
              {SECTIONS.find(s => s.id === section)?.label}
            </h2>
            <span className="font-mono text-[12px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
              {visible.length} {visible.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {visible.map((doc, i) => (
              <ArticleRow key={doc.slug} doc={doc} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FeaturedArticle({ doc }: { doc: Doc }) {
  return (
    <motion.section
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mb-24 border border-[color:var(--color-ink)] rounded-2xl bg-[color:var(--color-surface)] overflow-hidden"
    >
      <Link to={routeForDoc(doc)} className="grid md:grid-cols-[1fr_1.4fr]">
        <div className="bg-gradient-to-br from-[color:var(--color-hero-blue)] via-[color:var(--color-hero-violet)] to-[color:var(--color-hero-rose)] p-12 flex flex-col justify-end min-h-[320px]">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink)]/70 mb-3">
            Featured
          </div>
          <div className="font-headline text-[clamp(56px,8vw,112px)] leading-[0.9] uppercase text-[color:var(--color-ink)] tracking-tight">
            Episode<br />{doc.episodeNumber ?? '·'}
          </div>
        </div>
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] border border-[color:var(--color-ink)] rounded px-2 py-1">
              {eyebrowFor(doc)}
            </span>
            <span className="font-mono text-[12px] text-[color:var(--color-ink-faint)]">{readTime(doc.excerpt)}</span>
          </div>
          <h2 className="font-sans text-[clamp(28px,3vw,42px)] font-bold leading-[1.15] tracking-tight mb-5">
            {formatSnappyTitle(doc.title)}
          </h2>
          {doc.excerpt && (
            <p className="font-sans text-[16px] leading-relaxed text-[color:var(--color-ink-soft)] line-clamp-3 mb-8">
              {cleanExcerpt(doc.excerpt)}
            </p>
          )}
          <span className="font-mono text-[12px] uppercase tracking-wider text-[color:var(--color-ink)] border-b border-[color:var(--color-ink)] pb-1 self-start">
            Read the full episode →
          </span>
        </div>
      </Link>
    </motion.section>
  )
}

function ArticleRow({ doc, index }: { doc: Doc; index: number }) {
  const dateText = doc.date
    ? new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link
        to={routeForDoc(doc)}
        className="group block py-10 border-t border-[color:var(--color-rule)] hover:bg-[color:var(--color-rule-soft)]/40 transition-colors -mx-4 px-4 rounded-md"
      >
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] border border-[color:var(--color-ink-soft)] text-[color:var(--color-ink-soft)] rounded-sm px-2 py-0.5">
            {eyebrowFor(doc)}
          </span>
          {dateText && (
            <span className="font-mono text-[11px] text-[color:var(--color-ink-faint)]">{dateText}</span>
          )}
          <span className="font-mono text-[11px] text-[color:var(--color-ink-faint)]">·</span>
          <span className="font-mono text-[11px] text-[color:var(--color-ink-faint)]">{readTime(doc.excerpt)}</span>
        </div>
        <h3 className="font-sans text-[26px] md:text-[30px] font-bold leading-[1.2] tracking-tight text-[color:var(--color-ink)] group-hover:underline decoration-2 underline-offset-[6px]">
          {formatSnappyTitle(doc.title)}
        </h3>
        {doc.excerpt && (
          <p className="mt-4 font-sans text-[16px] leading-relaxed text-[color:var(--color-ink-soft)] line-clamp-2 max-w-3xl">
            {cleanExcerpt(doc.excerpt)}
          </p>
        )}
      </Link>
    </motion.div>
  )
}
