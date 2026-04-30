/**
 * Prose — single source of truth for rendering vault Markdown.
 *
 * Handles GFM tables, soft-break newlines (Obsidian-style), Obsidian `[[wikilinks]]`,
 * and routes internal links through react-router so SPA navigation works.
 */
import { Link } from 'react-router-dom'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import type { PluggableList } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import remarkWikiLink from 'remark-wiki-link'
import rehypeRaw from 'rehype-raw'
import { wikiPermalinks, routeForWikiKey } from '../lib/content'

const WIKILINK_PREFIX = 'wikilink:'

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function getTextContent(children: React.ReactNode): string {
  let text = ''
  React.Children.forEach(children, child => {
    if (typeof child === 'string' || typeof child === 'number') {
      text += child
    } else if (React.isValidElement(child) && typeof child.props === 'object' && child.props !== null && 'children' in child.props) {
      text += getTextContent((child.props as { children: React.ReactNode }).children)
    }
  })
  return text
}

const remarkPlugins: PluggableList = [
  remarkGfm,
  remarkBreaks,
  // Obsidian wikilinks: `[[Page Name]]` and `[[Page|Display Text]]`
  [
    remarkWikiLink,
    {
      permalinks: wikiPermalinks,
      aliasDivider: '|',
      hrefTemplate: (permalink: string) => `${WIKILINK_PREFIX}${permalink}`,
      pageResolver: (name: string) => [name.trim()],
    },
  ],
]

const rehypePlugins: PluggableList = [rehypeRaw]

const components: Components = {
  h2(props) {
    const text = getTextContent(props.children)
    return <h2 id={slugify(text)} className="scroll-mt-32">{props.children}</h2>
  },
  a(props) {
    const { href = '', children, ...rest } = props

    // Wikilink — resolve to an internal route via the manifest.
    if (href.startsWith(WIKILINK_PREFIX)) {
      const key = href.slice(WIKILINK_PREFIX.length)
      const route = routeForWikiKey(key)
      if (route) {
        return <Link to={route} className="text-[color:var(--color-accent)] border-b border-transparent hover:border-[color:var(--color-accent)]">{children}</Link>
      }
      // Unknown target — render as a "broken" wikilink with a tooltip-friendly title
      return <span className="text-[color:var(--color-ink-faint)] underline decoration-dotted cursor-help" title={`No vault entry for [[${key}]]`}>{children}</span>
    }

    // Internal site links → react-router Link
    if (href.startsWith('/')) {
      return <Link to={href} className="text-[color:var(--color-accent)] border-b border-transparent hover:border-[color:var(--color-accent)]">{children}</Link>
    }

    // External — open in new tab
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...rest} className="text-[color:var(--color-accent)] border-b border-transparent hover:border-[color:var(--color-accent)]">
        {children}
      </a>
    )
  },
}

export function Prose({ children }: { children: string }) {
  return (
    <div className="prose-body">
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

/** Inline variant — for one-line markdown snippets that should not introduce a `<p>`. */
export function ProseInline({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={{ ...components, p: ({ children }) => <span>{children}</span> }}
    >
      {children}
    </ReactMarkdown>
  )
}
