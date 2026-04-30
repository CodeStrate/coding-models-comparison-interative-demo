/**
 * build-content.ts — copies vault MDs into src/content/vault/ and emits a manifest.
 *
 * Vault is the single source of truth. This script is the only bridge.
 * Run manually: `bun run content` (or `bun run scripts/build-content.ts`).
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync, cpSync, statSync } from 'node:fs'
import { dirname, join, basename, relative } from 'node:path'
import matter from 'gray-matter'
import { config as dotenvConfig } from 'dotenv'

// Load .env.local first (developer overrides), then .env. dotenv won't
// overwrite already-set vars, so this gives the .local file priority while
// still picking up shared defaults from .env.
dotenvConfig({ path: '.env.local' })
dotenvConfig()

/** Recursively walk a directory, returning absolute paths to .md files. */
function walkMarkdown(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const s = statSync(full)
    if (s.isDirectory()) out.push(...walkMarkdown(full))
    else if (s.isFile() && entry.endsWith('.md')) out.push(full)
  }
  return out
}

// Source vault path — set via env so it never lives in version control.
//   bun run content                     # uses VAULT_ROOT from .env / shell
//   VAULT_ROOT=/path/to/vault bun run content
const VAULT_ROOT = process.env.VAULT_ROOT ?? ''
const OUT_DIR = join(process.cwd(), 'src/content/vault')
const MANIFEST_PATH = join(process.cwd(), 'src/content/manifest.json')

type DocType = 'episode' | 'deliberation' | 'rubric' | 'plan' | 'methodology' | 'gauntlet' | 'welcome' | 'retest' | 'other'

type Doc = {
  slug: string         // url-safe filename without extension
  wikiKey: string      // basename without extension, preserves original case + underscores. The literal `[[...]]` target.
  filename: string     // original filename
  title: string        // frontmatter title > first H1 > filename
  type: DocType
  date?: string        // frontmatter date > date parsed from filename
  episodeNumber?: number
  excerpt: string      // frontmatter description > first prose paragraph
  frontmatter?: Record<string, unknown>
}

function classify(filename: string, relPath: string): DocType {
  const f = filename.toLowerCase()
  const dir = relPath.toLowerCase()
  if (dir.includes('episode') || f.startsWith('episode-')) return 'episode'
  if (dir.includes('deliberation') || f.startsWith('deliberation-')) return 'deliberation'
  if (f === 'eval_rubric.md') return 'rubric'
  // april-plan: deliberately excluded from the public site (internal scheduling doc)
  if (f === 'april-plan.md') return 'other'
  if (f === 'v2.1-gauntlet-methodology.md') return 'methodology'
  if (f === 'champion-gauntlet-plan.md') return 'gauntlet'
  if (f === 'welcome.md') return 'welcome'
  if (f === 'scores.md' || f === 'stock-vs-tuned-comparison.md') return 'methodology'
  if (f.includes('retest')) return 'retest'
  return 'other'
}

/** Convert "deliberation-29.4.26" → "2026-04-29" (assumes 26 = 2026, DD.M.YY). */
function dateFromFilename(filename: string): string | undefined {
  const m = filename.match(/(\d{1,2})\.(\d{1,2})\.(\d{2})/)
  if (!m) return
  const [, day, month, yy] = m
  const year = 2000 + parseInt(yy, 10)
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function episodeNumber(filename: string): number | undefined {
  const m = filename.match(/^episode-(\d+)/i)
  return m ? parseInt(m[1], 10) : undefined
}

function slugify(filename: string): string {
  return basename(filename, '.md').toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function extractTitle(body: string, fallback: string): string {
  const m = body.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : fallback
}

function extractExcerpt(body: string): string {
  // Strip leading title + frontmatter-ish blockquote tagline, find first prose paragraph
  const lines = body.split('\n')
  let i = 0
  // Skip H1
  while (i < lines.length && !/^[a-z0-9_*-]/i.test(lines[i])) i++
  // Skip blockquote tagline
  while (i < lines.length && lines[i].startsWith('>')) i++
  // Skip blank
  while (i < lines.length && lines[i].trim() === '') i++
  // Skip horizontal rules
  while (i < lines.length && /^---+$/.test(lines[i].trim())) i++
  while (i < lines.length && lines[i].trim() === '') i++
  // First H2 + body? Or just plain prose? Take next non-heading paragraph.
  const para: string[] = []
  while (i < lines.length) {
    const l = lines[i]
    if (l.trim() === '') break
    if (/^#{1,6}\s/.test(l)) { i++; continue }
    para.push(l)
    i++
  }
  const txt = para.join(' ').replace(/\s+/g, ' ').trim()
  return txt.length > 280 ? txt.slice(0, 277) + '…' : txt
}

function main() {
  if (!VAULT_ROOT) {
    console.error('[build-content] VAULT_ROOT env var not set. Skipping.')
    console.error('  Set it in .env.local or pass inline:  VAULT_ROOT=/path/to/vault bun run content')
    return
  }
  if (!existsSync(VAULT_ROOT)) {
    console.error(`[build-content] Vault not found at ${VAULT_ROOT}. Skipping.`)
    return
  }

  // Wipe + recreate output
  rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })

  const files = walkMarkdown(VAULT_ROOT)
  const docs: Doc[] = []

  for (const fullPath of files) {
    const filename = basename(fullPath)
    const relPath = relative(VAULT_ROOT, fullPath)

    // Preserve the vault subtree so task runs with duplicate filenames do not overwrite each other.
    const dst = join(OUT_DIR, relPath)
    mkdirSync(dirname(dst), { recursive: true })
    cpSync(fullPath, dst)

    const raw = readFileSync(fullPath, 'utf8')
    const type = classify(filename, relPath)
    if (type === 'other') continue

    // Pull frontmatter via gray-matter — Obsidian/Iceberg-style YAML at the head.
    const { data: frontmatter, content: body } = matter(raw)

    const slug = slugify(filename)
    const wikiKey = basename(filename, '.md')

    docs.push({
      slug,
      wikiKey,
      filename: relPath,
      title: (frontmatter.title as string) || extractTitle(body, wikiKey),
      type,
      date: (frontmatter.date as string) || dateFromFilename(filename),
      episodeNumber: (frontmatter.episode as number) || episodeNumber(filename),
      excerpt: (frontmatter.description as string) || extractExcerpt(body),
      frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
    })
  }

  // Sort: episodes by number, deliberations newest first, others by title
  docs.sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type)
    if (a.type === 'episode') return (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0)
    if (a.date && b.date) return b.date.localeCompare(a.date)
    return a.title.localeCompare(b.title)
  })

  mkdirSync(join(process.cwd(), 'src/content'), { recursive: true })
  writeFileSync(MANIFEST_PATH, JSON.stringify(docs, null, 2))
  console.log(`[build-content] Copied ${files.length} files, indexed ${docs.length} docs to ${MANIFEST_PATH}`)
}

main()
