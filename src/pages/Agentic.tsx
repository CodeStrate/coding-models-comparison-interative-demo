import { Link } from 'react-router-dom'
import { agentic, type AgenticRow, type Chip } from '../lib/agentic'
import { getModel } from '../lib/models'
import { BrandIcon } from '../components/BrandIcon'

export function Agentic() {
  return (
    <article className="px-4 sm:px-6 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="inline-flex items-center font-mono text-[28px] tracking-[0.08em] uppercase border border-[color:var(--color-ink)] rounded-md px-3 py-2 mb-14">
          Episode: 1
        </div>

        <h1 className="max-w-5xl text-[clamp(38px,4.6vw,64px)] font-black leading-tight tracking-tight mb-7">
          Same bug. Three models. One loop.
        </h1>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8 lg:gap-16">
          <aside className="lg:border-r lg:border-[color:var(--color-ink)] lg:pr-7">
            <div className="font-mono text-sm font-semibold mb-2">Harness</div>
            <p className="font-mono text-sm leading-snug mb-8">{agentic.harness}</p>

            <div className="border-t border-[color:var(--color-ink)]">
              {agentic.rows.map(row => (
                <AgenticRailItem key={row.modelSlug} row={row} />
              ))}
            </div>
          </aside>

          <div className="max-w-5xl">
            <p className="text-[clamp(22px,2.4vw,30px)] leading-snug mb-14">
              {agentic.intro}
            </p>

            <div className="flex flex-col border-t border-[color:var(--color-ink)]">
              {agentic.rows.map(row => (
                <ModelRunSection key={row.modelSlug} row={row} />
              ))}
            </div>

            <div className="mt-16 border-t border-[color:var(--color-ink)] pt-8 font-mono text-sm leading-relaxed text-[color:var(--color-ink-soft)]">
              <p className="mb-5">{agentic.caveat}</p>
              {agentic.footnote.split('\n\n').map((p, i) => (
                <p key={i} className="mb-3 last:mb-0">{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function AgenticRailItem({ row }: { row: AgenticRow }) {
  const model = getModel(row.modelSlug)

  return (
    <a href={`#${row.modelSlug}`} className="block border-b border-[color:var(--color-ink)] py-5 hover:bg-[color:var(--color-rule-soft)] transition-colors">
      <div className="font-headline text-[28px] sm:text-[34px] leading-none">{row.rank}</div>
      <div className="font-sans font-bold leading-tight mt-2">{model?.name ?? row.modelSlug}</div>
      <div className="font-mono text-[11px] uppercase text-[color:var(--color-ink-soft)] mt-1">{row.verdict}</div>
    </a>
  )
}

function ModelRunSection({ row }: { row: AgenticRow }) {
  const model = getModel(row.modelSlug)
  const tone = TONE_ACCENT[row.tone]

  return (
    <section id={row.modelSlug} className="scroll-mt-36 border-b border-[color:var(--color-ink)] py-10 sm:py-12 block bg-transparent">
      <header className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-10 mb-8">
        <div className={['font-headline text-[clamp(56px,10vw,110px)] leading-none', tone.text].join(' ')}>
          {row.rank}
        </div>
        {model && <BrandIcon model={model} className="w-16 h-16 sm:w-[100px] sm:h-[100px] text-[color:var(--color-ink)] shrink-0" aria-hidden />}
        <div className="min-w-0 pt-1 sm:pt-2">
          {model ? (
            <Link to={`/models/${model.slug}`} className="group inline-block">
              <h2 className="font-mono whitespace-pre-line text-[clamp(28px,3vw,48px)] font-semibold leading-[1.05] tracking-[0.04em] uppercase text-[color:var(--color-ink)] group-hover:underline transition-all">
                {model.name}
              </h2>
              {model.variant && (
                <div className="font-mono text-xs uppercase tracking-[0.15em] text-[color:var(--color-ink-soft)] mt-2">
                  {model.variant}
                </div>
              )}
            </Link>
          ) : (
            <h2 className="font-mono whitespace-pre-line text-[clamp(28px,3vw,48px)] font-semibold leading-[1.05] tracking-[0.04em] uppercase text-[color:var(--color-ink)]">
              {row.modelSlug}
            </h2>
          )}
          <div className={['inline-flex mt-5 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm', tone.pill].join(' ')}>
            {row.verdict}
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-3 mb-8">
        {row.chips.map((chip, i) => (
          <ChipPill key={i} chip={chip} />
        ))}
      </div>

      <p className="text-[clamp(16px,1.5vw,20px)] leading-relaxed text-[color:var(--color-ink)]">{row.body}</p>
    </section>
  )
}

function ChipPill({ chip }: { chip: Chip }) {
  return (
    <span className={['font-mono text-[11px] uppercase tracking-wider px-2 py-1 rounded-sm border', TONE_CHIP[chip.tone]].join(' ')}>
      {chip.text}
    </span>
  )
}

const TONE_ACCENT: Record<'good' | 'warn' | 'bad', { text: string; pill: string }> = {
  good: {
    text: 'text-[#257847]',
    pill: 'bg-[#257847]/10 text-[#257847] border border-[#257847]/40',
  },
  warn: {
    text: 'text-[#8c6a19]',
    pill: 'bg-[#8c6a19]/10 text-[#8c6a19] border border-[#8c6a19]/40',
  },
  bad: {
    text: 'text-[#a04a3c]',
    pill: 'bg-[#a04a3c]/10 text-[#a04a3c] border border-[#a04a3c]/40',
  },
}

const TONE_CHIP: Record<'good' | 'warn' | 'bad', string> = {
  good: 'border-[#257847]/40 text-[#257847] bg-[#257847]/5',
  warn: 'border-[#8c6a19]/40 text-[#8c6a19] bg-[#8c6a19]/5',
  bad: 'border-[#a04a3c]/40 text-[#a04a3c] bg-[#a04a3c]/5',
}
