/**
 * TaskScoreboard — render the per-task score breakdown for a single model.
 * Pure presenter: receives an array of scores; renders the rubric tasks in order,
 * showing N/A for tasks the model didn't attempt.
 */
import { TASK_IDS, taskLabel, type TaskScore, type TaskId } from '../lib/models'

const SHOT_GLYPH: Record<1 | 2 | 3, string> = { 1: '①', 2: '②', 3: '③' }

function ScoreCell({ score }: { score: TaskScore | undefined }) {
  if (!score) {
    return <span className="text-[color:var(--color-ink-faint)]">— not tested</span>
  }
  if (score.dnf) {
    return <span className="font-mono text-sm text-[color:var(--color-danger)]">DNF</span>
  }
  const final = score.final ?? score.raw ?? 0
  return (
    <span className="font-mono text-sm">
      <span className="font-semibold">{final}</span>
      <span className="text-[color:var(--color-ink-faint)]">/10</span>
      {score.shots && score.shots > 1 && (
        <span className="ml-1 text-[color:var(--color-ink-faint)]">{SHOT_GLYPH[score.shots]}</span>
      )}
    </span>
  )
}

export function TaskScoreboard({ scores }: { scores: TaskScore[] }) {
  const byId: Record<string, TaskScore> = {}
  for (const s of scores) byId[s.task] = s

  return (
    <div className="rounded-2xl border-[1.5px] border-[color:var(--color-ink)] overflow-hidden">
      {TASK_IDS.map((id, i) => {
        const score = byId[id]
        return <TaskRow key={id} id={id} score={score} dim={i % 2 === 1} />
      })}
    </div>
  )
}

function TaskRow({ id, score, dim }: { id: TaskId; score: TaskScore | undefined; dim: boolean }) {
  const hasNote = Boolean(score?.note);

  return (
    <div className={['grid grid-cols-[64px_1fr_110px] sm:grid-cols-[80px_1fr_140px] items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-b last:border-b-0 border-[color:var(--color-rule-soft)]', dim ? 'bg-[color:var(--color-bg-deep)]/50' : ''].join(' ')}>
      <div className="font-mono text-[11px] sm:text-xs uppercase tracking-wider text-[color:var(--color-ink-soft)] self-start mt-0.5">
        {id.toUpperCase()}
      </div>
      <div>
        <div className="font-sans text-[14px] sm:text-[15px] font-semibold leading-tight">
          {taskLabel(id)}
        </div>
        {hasNote && (
          <div className="text-[12px] sm:text-[13px] text-[color:var(--color-ink-soft)] mt-1.5 leading-snug">
            {score!.note}
          </div>
        )}
      </div>
      <div className="text-right self-start mt-0.5">
        <ScoreCell score={score} />
      </div>
    </div>
  )
}
