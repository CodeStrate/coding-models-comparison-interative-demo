import { Prose } from '../components/Prose'
import { docsByType, getDocBody } from '../lib/content'

export function Rubrics() {
  const rubric = docsByType('rubric')[0]
  const body = rubric ? getDocBody(rubric.filename) ?? '' : ''

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="inline-flex items-center font-mono text-sm font-semibold tracking-wide border border-[color:var(--color-ink)] rounded px-3 py-2 mb-6">
        RUBRICS
      </div>
      {rubric ? (
        <>
          <h1 className="text-[clamp(28px,4vw,40px)] font-bold leading-tight mb-10">{rubric.title}</h1>
          <Prose>{body.replace(/^#\s+.+\n/, '')}</Prose>
        </>
      ) : (
        <p className="font-mono text-sm text-[color:var(--color-ink-soft)]">No rubric in the vault.</p>
      )}
    </div>
  )
}
