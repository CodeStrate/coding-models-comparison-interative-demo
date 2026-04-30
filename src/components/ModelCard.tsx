import { Link } from 'react-router-dom'
import type { Model } from '../lib/models'
import { BrandIcon } from './BrandIcon'

type ModelCardProps = {
  model: Model
  /** Right-column cards in a 2-up grid get extra left padding so they don't crowd the divider. */
  extraLeftPad?: boolean
}

export function ModelCard({ model, extraLeftPad = false }: ModelCardProps) {
  const variantText = model.variant || (model.name.includes("Thinking") ? "THINKING (THINK TOKEN ON)" : model.name.includes("No Think") ? "NO THINK" : model.name.includes("Tuned") ? "TUNED" : "")

  // Inline-style the left padding so it cannot be missed by Tailwind's class scanner.
  // Right-column cards (extraLeftPad=true) get a deeper bump so they don't crowd the divider.
  // Below md the grid is single-column and only the base value applies.
  const paddingLeft = extraLeftPad
    ? 'clamp(1.25rem, 6vw, 7rem)'   // ~20px → 112px
    : 'clamp(1.25rem, 3.5vw, 4rem)' // ~20px → 64px

  return (
    <Link
      to={`/models/${model.slug}`}
      style={{ paddingLeft }}
      className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-16 md:gap-[100px] pr-4 sm:pr-16 md:pr-20 py-10 sm:py-16 min-h-[220px] sm:min-h-[240px] bg-[color:var(--color-bg)] overflow-hidden h-full active:bg-[color:var(--color-rule-soft)]/60 transition-colors"
    >
      {/* Bottom wipe — desktop hover. Touch devices fire :active during tap, so
         we keep group-active triggers as well so the card flashes feedback
         before navigation kicks in. */}
      <div className="absolute inset-0 bg-[color:var(--color-ink)] origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 group-active:scale-y-100 z-0" />

      <BrandIcon model={model} className="w-[64px] h-[64px] sm:w-[110px] sm:h-[110px] shrink-0 relative z-10 text-[color:var(--color-ink)] group-hover:text-[color:var(--color-bg)] group-active:text-[color:var(--color-bg)] transition-colors duration-500" aria-hidden />

      <div className="min-w-0 relative z-10">
        <div className="font-mono whitespace-pre-line text-[clamp(28px,6vw,56px)] font-semibold leading-[0.95] tracking-[0.06em] uppercase text-[color:var(--color-ink)] group-hover:text-[color:var(--color-bg)] group-active:text-[color:var(--color-bg)] transition-colors duration-500">
          {cardTitle(model)}
        </div>
        {(variantText || model.quant) && (
          <div className="font-mono text-[11px] sm:text-[12px] tracking-[0.18em] sm:tracking-[0.2em] uppercase mt-2 sm:mt-3 opacity-70 text-[color:var(--color-ink-soft)] group-hover:text-[color:var(--color-rule-soft)] group-active:text-[color:var(--color-rule-soft)] transition-colors duration-500">
            {[variantText, model.quant].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>
    </Link>
  )
}

function cardTitle(model: Model) {
  if (model.name.includes('GPT OSS')) return `GPT OSS\n20B`.trim()
  if (model.slug.startsWith('lfm2')) return `LFM2\n24B`.trim()
  if (model.name.includes('Gemma')) return `GEMMA 4\n${model.quant ?? ''}`.trim()
  if (model.name.includes('Sushi')) return `SUSHI\n9B`.trim()
  return model.name
}
