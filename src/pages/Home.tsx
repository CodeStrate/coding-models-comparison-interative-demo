import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeroCarousel } from '../components/HeroCarousel'
import { recentDocs, type Doc } from '../lib/content'
import { TASK_IDS, activeModels, findScore, taskShortLabel, type Model, type TaskId } from '../lib/models'

export function Home() {
  const recent = recentDocs(8)

  return (
    <>
      <HeroCarousel />

      {/* leaderboard preview */}
      <section className="px-6 pt-16 pb-28">
        <h2 className="font-mono font-bold uppercase tracking-[0.15em] text-center text-[clamp(24px,4vw,40px)] leading-none mb-14">
          Current Leaderboard
        </h2>
        <LeaderboardPreview />
        <div className="mt-10 text-center">
          <Link to="/leaderboard" className="font-mono text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]">
            View full leaderboard →
          </Link>
        </div>
      </section>

      {/* latest articles / episodes */}
      <section className="px-6 py-16 border-t border-[color:var(--color-rule)]">
        <div className="max-w-7xl mx-auto mb-8 flex items-baseline justify-between">
          <h2 className="font-mono font-bold uppercase tracking-[0.15em] text-[clamp(22px,3.4vw,34px)]">Latest from the gauntlet</h2>
          <Link to="/blog" className="font-sans text-[15px] text-[color:var(--color-ink)] hover:text-black">
            View more →
          </Link>
        </div>
        <div className="max-w-7xl mx-auto border-t border-[color:var(--color-ink)]">
          {recent.map((doc, i) => (
            <ArticleTile key={doc.slug} doc={doc} delay={i * 0.04} />
          ))}
        </div>
      </section>
    </>
  )
}

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

function ArticleTile({ doc, delay }: { doc: Doc; delay: number }) {
  const href = doc.type === 'episode' ? `/blog/${doc.slug}` : doc.type === 'deliberation' ? `/deliberations/${doc.slug}` : `/docs/${doc.slug}`
  const eyebrow = doc.type === 'episode' ? `EPISODE${doc.episodeNumber ? ` ${doc.episodeNumber}` : ''}` : doc.type.toUpperCase()
  const dateText = doc.date
    ? new Date(doc.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
    : ''

  const snappyTitle = formatSnappyTitle(doc.title)

  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay }}
    >
      <Link to={href} className="group block border-b border-[color:var(--color-rule)] bg-transparent hover:bg-[color:var(--color-rule-soft)]/40 transition-colors">
        <div className="grid md:grid-cols-[160px_1fr_90px] gap-6 sm:gap-10 py-5 sm:py-6">
          <div className="flex flex-col items-start gap-1.5">
            <span className="inline-flex font-mono text-[10px] tracking-wide uppercase text-[color:var(--color-ink-soft)] border border-[color:var(--color-rule)] rounded-sm px-1.5 py-0.5">
              {eyebrow}
            </span>
            {dateText && <p className="font-mono text-[11px] text-[color:var(--color-ink-faint)] m-0">{dateText}</p>}
          </div>
          <div className="min-w-0 pr-4 flex flex-col justify-start gap-1.5">
            <h3 className="font-mono text-[16px] sm:text-[19px] uppercase tracking-wide font-semibold leading-[1.25] group-hover:underline text-[color:var(--color-ink)] m-0">{snappyTitle}</h3>
            {doc.excerpt && <p className="text-[14px] leading-snug text-[color:var(--color-ink-soft)] m-0 max-w-3xl line-clamp-2">{cleanExcerpt(doc.excerpt)}</p>}
          </div>
          <div className="font-mono text-[11px] uppercase text-[color:var(--color-ink-faint)] md:text-right pt-1 transition-colors group-hover:text-[color:var(--color-ink)]">
            READ →
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function cleanExcerpt(excerpt: string) {
  return excerpt.replace(/\*\*/g, '').replace(/\[\[(.*?)\]\]/g, '$1')
}

/** Static-shape preview — full table lives at /leaderboard. */
function LeaderboardPreview() {
  const tasks = TASK_IDS.slice(0, 4)
  const rows = activeModels()
    .filter(model => model.averageScore !== undefined)
    .sort((a, b) => (b.averageScore ?? -1) - (a.averageScore ?? -1))
    .slice(0, 4)

  return (
    <div className="max-w-5xl mx-auto border-[1.5px] border-[color:var(--color-ink)] rounded-3xl bg-[color:var(--color-bg)] p-8">
      <div className="grid grid-cols-[2fr_repeat(4,1fr)] gap-4 pb-5 border-b border-[color:var(--color-ink)] font-mono text-sm font-semibold tracking-wider uppercase">
        <span>Model</span>
        {tasks.map(task => <span key={task}>{taskShortLabel(task)}</span>)}
      </div>
      {rows.map((row) => (
        <div key={row.slug} className="grid grid-cols-[2fr_repeat(4,1fr)] gap-4 py-5 font-mono text-[14px] uppercase tracking-wide border-t border-[color:var(--color-rule-soft)] first:border-t-0 items-center hover:bg-[color:var(--color-rule-soft)] transition-colors -mx-4 px-4 rounded-lg">
          <div>
            <div className="font-headline tracking-[0.03em] text-[22px] leading-[0.95] uppercase">{formatPreviewName(row)}</div>
            <div className="text-[color:var(--color-ink-faint)] text-[12px] mt-1.5 font-mono">{formatPreviewMeta(row)}</div>
          </div>
          {tasks.map(task => (
            <span key={task} className="text-[color:var(--color-ink-soft)] font-medium">{formatTaskScore(row, task)}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

function formatPreviewName(model: Model) {
  return [model.name, model.variant].filter(Boolean).join(' ')
}

function formatPreviewMeta(model: Model) {
  return [model.quant, model.params].filter(Boolean).join(' · ')
}

function formatTaskScore(model: Model, task: TaskId) {
  const score = findScore(model, task)
  if (!score) return '—'
  if (score.dnf) return 'DNF'
  const value = score.final ?? score.raw
  if (value === undefined) return '—'
  if (score.shots === 2) return `${value} ②`
  if (score.shots === 3) return `${value} ③`
  return String(value)
}
