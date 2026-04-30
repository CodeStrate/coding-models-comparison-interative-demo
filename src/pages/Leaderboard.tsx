import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TASK_IDS, taskShortLabel, models, findScore, type Model, type TaskId } from '../lib/models'
import { BrandIcon } from '../components/BrandIcon'

type SortKey = 'rank' | 'name' | 'avg' | TaskId
type SortDir = 'asc' | 'desc'

export function Leaderboard() {
  const [sortKey, setSortKey] = useState<SortKey>('avg')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => sortModels(models, sortKey, sortDir), [sortKey, sortDir])

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-10">
        <div className="inline-flex items-center font-mono text-sm font-semibold tracking-wide border border-[color:var(--color-ink)] rounded px-3 py-2">
          LEADERBOARD
        </div>
        <div className="font-mono text-xs text-[color:var(--color-ink-faint)]">
          {models.length} models · 7 tasks · click any column to sort
        </div>
      </div>

      <h1 className="font-mono font-bold uppercase tracking-[0.04em] text-center text-[clamp(44px,6vw,82px)] leading-none mb-12">
        Current Leaderboard
      </h1>

      <div className="border-[1.5px] border-[color:var(--color-ink)] rounded-2xl bg-[color:var(--color-bg)] overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-[color:var(--color-ink)]">
              <Th label="Model" sortKey="name" current={sortKey} dir={sortDir} onSort={onSort} align="left" wide />
              <Th label="Avg" sortKey="avg" current={sortKey} dir={sortDir} onSort={onSort} align="right" />
              {TASK_IDS.map(id => (
                <Th
                  key={id}
                  label={taskShortLabel(id)}
                  sublabel={id.toUpperCase()}
                  sortKey={id}
                  current={sortKey}
                  dir={sortDir}
                  onSort={onSort}
                  align="right"
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((model, i) => (
              <Row key={model.slug} model={model} rank={i + 1} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Th({ label, sublabel, sortKey, current, dir, onSort, align, wide }: {
  label: string
  sublabel?: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  onSort: (k: SortKey) => void
  align: 'left' | 'right'
  wide?: boolean
}) {
  const isActive = current === sortKey
  return (
    <th className={[
      'font-mono text-[11px] uppercase tracking-wider font-semibold py-4 px-4',
      align === 'left' ? 'text-left' : 'text-right',
      wide ? 'min-w-[260px]' : '',
    ].join(' ')}>
      <button
        onClick={() => onSort(sortKey)}
        className={[
          'inline-flex items-center gap-1.5 whitespace-nowrap',
          isActive ? 'text-[color:var(--color-ink)]' : 'text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]',
        ].join(' ')}
      >
        <span className="flex flex-col items-end">
          <span>{label}</span>
          {sublabel && <span className="text-[9px] opacity-60">{sublabel}</span>}
        </span>
        {isActive && <Caret dir={dir} />}
      </button>
    </th>
  )
}

function Caret({ dir }: { dir: SortDir }) {
  return <span className="text-[10px]">{dir === 'asc' ? '▲' : '▼'}</span>
}

function Row({ model, rank }: { model: Model; rank: number }) {
  return (
    <tr className="border-b last:border-b-0 border-[color:var(--color-rule-soft)] hover:bg-[color:var(--color-rule-soft)] transition-colors">
      <td className="py-4 px-4">
        <Link to={`/models/${model.slug}`} className="flex items-center gap-3 group">
          <span className="font-mono text-xs text-[color:var(--color-ink-faint)] w-6 shrink-0">
            {String(rank).padStart(2, '0')}
          </span>
          <BrandIcon model={model} className="w-7 h-7 text-[color:var(--color-ink)] shrink-0" aria-hidden />
          <span className="min-w-0">
            <span className="block font-mono text-[15px] font-bold leading-[1.05] tracking-[0.02em] uppercase group-hover:underline">
              {model.name}
            </span>
            {model.variant && (
              <span className="block font-mono text-[10px] uppercase tracking-wider text-[color:var(--color-ink-soft)] mt-0.5">
                {model.variant}
              </span>
            )}
          </span>
        </Link>
      </td>
      <td className="py-4 px-4 text-right">
        <AverageCell model={model} />
      </td>
      {TASK_IDS.map(id => {
        const s = findScore(model, id)
        return (
          <td key={id} className="py-4 px-4 text-right">
            <ScoreCell score={s} />
          </td>
        )
      })}
    </tr>
  )
}

function AverageCell({ model }: { model: Model }) {
  if (model.status === 'bench' || model.status === 'dnf') {
    return <span className="font-mono text-[11px] uppercase text-[color:var(--color-danger)]">DNF</span>
  }
  if (model.status === 'retired') {
    return <span className="font-mono text-[11px] uppercase text-[color:var(--color-ink-faint)]">retired</span>
  }
  if (model.averageScore === undefined) {
    return <span className="text-[color:var(--color-ink-faint)]">—</span>
  }
  return (
    <span className="font-mono text-[24px] font-bold leading-none tracking-[0.02em]">
      {model.averageScore.toFixed(1)}
    </span>
  )
}

function ScoreCell({ score }: { score: ReturnType<typeof findScore> }) {
  if (!score) {
    return <span className="text-[color:var(--color-ink-faint)] text-sm">—</span>
  }
  if (score.dnf) {
    return <span className="font-mono text-xs text-[color:var(--color-danger)]">DNF</span>
  }
  const value = score.final ?? score.raw ?? 0
  return (
    <span className="font-mono text-sm">
      <span className="font-semibold">{value}</span>
      {score.shots && score.shots > 1 && (
        <span className="ml-1 text-[10px] text-[color:var(--color-ink-faint)]">
          {score.shots === 2 ? '②' : '③'}
        </span>
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------
function sortModels(list: Model[], key: SortKey, dir: SortDir): Model[] {
  const mul = dir === 'asc' ? 1 : -1
  const out = [...list]

  out.sort((a, b) => {
    if (key === 'name') {
      return a.name.localeCompare(b.name) * mul
    }
    if (key === 'avg' || key === 'rank') {
      const av = a.averageScore ?? -1
      const bv = b.averageScore ?? -1
      if (av !== bv) return (av - bv) * mul
      return a.name.localeCompare(b.name)
    }
    // task column
    const av = scoreSortValue(findScore(a, key))
    const bv = scoreSortValue(findScore(b, key))
    if (av !== bv) return (av - bv) * mul
    return a.name.localeCompare(b.name)
  })

  return out
}

function scoreSortValue(s: ReturnType<typeof findScore>): number {
  if (!s) return -2
  if (s.dnf) return -1
  return s.final ?? s.raw ?? 0
}
