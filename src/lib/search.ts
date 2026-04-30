/**
 * Search index — flat record of every navigable thing in the app.
 * Used by the command palette (Cmd/Ctrl+K) for autocomplete.
 */
import { docs, routeForDoc } from './content'
import { models } from './models'

export type SearchHit = {
  id: string
  title: string
  subtitle?: string
  category: 'Episode' | 'Deliberation' | 'Methodology' | 'Plan' | 'Rubric' | 'Model' | 'Page'
  route: string
  haystack: string  // lowercase — concat of all searchable text
}

const PAGES: SearchHit[] = [
  { id: 'page-home', title: 'Home', subtitle: 'LLM Gauntlet overview', category: 'Page', route: '/', haystack: 'home overview gauntlet' },
  { id: 'page-models', title: 'Models', subtitle: 'All tested models', category: 'Page', route: '/models', haystack: 'models all list catalogue' },
  { id: 'page-blog', title: 'Blog', subtitle: 'Episodes & deliberations', category: 'Page', route: '/blog', haystack: 'blog episodes deliberations' },
  { id: 'page-agentic', title: 'Agentic', subtitle: 'Agentic workflow tests', category: 'Page', route: '/agentic', haystack: 'agentic workflow opencode' },
  { id: 'page-rubrics', title: 'Rubrics', subtitle: 'Scoring rubrics & traps', category: 'Page', route: '/rubrics', haystack: 'rubrics scoring traps tasks' },
  { id: 'page-leaderboard', title: 'Leaderboard', subtitle: 'Scores by model', category: 'Page', route: '/leaderboard', haystack: 'leaderboard scores ranking' },
]

function categoryFor(type: string): SearchHit['category'] {
  switch (type) {
    case 'episode': return 'Episode'
    case 'deliberation':
    case 'retest':
      return 'Deliberation'
    case 'methodology':
    case 'gauntlet':
    case 'welcome':
      return 'Methodology'
    case 'plan': return 'Plan'
    case 'rubric': return 'Rubric'
    default: return 'Methodology'
  }
}

function subtitleFor(doc: typeof docs[number]): string | undefined {
  const trimmed = doc.excerpt?.trim()
  if (trimmed) return trimmed.length > 120 ? trimmed.slice(0, 120) + '…' : trimmed
  if (doc.date) {
    const d = new Date(doc.date)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
  }
  return undefined
}

const DOC_HITS: SearchHit[] = docs.map(doc => ({
  id: `doc-${doc.slug}`,
  title: doc.title,
  subtitle: subtitleFor(doc),
  category: categoryFor(doc.type),
  route: routeForDoc(doc),
  haystack: [doc.title, doc.excerpt, doc.slug, doc.type, doc.date]
    .filter(Boolean)
    .join(' ')
    .toLowerCase(),
}))

const MODEL_HITS: SearchHit[] = models.map(m => ({
  id: `model-${m.slug}`,
  title: [m.name, m.variant].filter(Boolean).join(' '),
  subtitle: [m.vendor, m.params, m.quant].filter(Boolean).join(' · '),
  category: 'Model',
  route: `/models/${m.slug}`,
  haystack: [m.name, m.variant, m.vendor, m.summary, m.params, m.quant, m.slug]
    .filter(Boolean)
    .join(' ')
    .toLowerCase(),
}))

export const SEARCH_INDEX: SearchHit[] = [...PAGES, ...DOC_HITS, ...MODEL_HITS]

/**
 * Score a hit against a query. Returns null if no match.
 * Scoring favors prefix/exact title matches over substring.
 */
function scoreHit(hit: SearchHit, query: string): number | null {
  if (!query) return 0
  const q = query.toLowerCase().trim()
  const title = hit.title.toLowerCase()

  if (title === q) return 1000
  if (title.startsWith(q)) return 500 - title.length
  if (title.includes(q)) return 300 - title.indexOf(q)

  // multi-token AND match against haystack
  const tokens = q.split(/\s+/).filter(Boolean)
  if (tokens.every(t => hit.haystack.includes(t))) {
    return 100 - hit.haystack.indexOf(tokens[0])
  }
  return null
}

export function searchAll(query: string, limit = 12): SearchHit[] {
  if (!query.trim()) {
    // No query — show featured items: latest episodes + recent deliberations
    return SEARCH_INDEX
      .filter(h => h.category === 'Episode' || h.category === 'Deliberation')
      .slice(0, limit)
  }

  const scored: Array<{ hit: SearchHit; score: number }> = []
  for (const hit of SEARCH_INDEX) {
    const score = scoreHit(hit, query)
    if (score !== null) scored.push({ hit, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map(s => s.hit)
}
