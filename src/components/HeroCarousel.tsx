import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { activeModels, groupedModels, type Model, type ModelGroup } from '../lib/models'
import { BrandIcon } from './BrandIcon'

const SLIDE_DURATION_MS = 7000

type Slide = {
  name: string
  wordmark: string
  /** Iconify icon ID — fetched lazily from the Iconify CDN. */
  icon: string
  /** Optional fallback path if the Iconify icon hasn't loaded yet (renders inline). */
  fallback?: 'star' | 'phi' | 'bars' | 'circle' | null
  gradientFrom: string
  gradientTo: string
  activeDot: string
  model: Model
  variants: Model[]
}

const HERO_GRADIENTS = [
  'var(--color-hero-green)',
  'var(--color-hero-blue)',
  'var(--color-hero-violet)',
  'var(--color-hero-amber)',
  'var(--color-hero-rose)',
]

// Active-bullet colors — deeper than the gradient endpoints so they read
// against their own slide background. The original mid-tones (e.g. #6689dc
// for Gemma against a #6e8dea gradient) blended into the background.
const HERO_DOTS = ['#2b9b3a', '#2447a6', '#6931c3', '#a24d18', '#b3245d']

const FALLBACK_BY_VENDOR: Record<string, FallbackKind> = {
  Google: 'star',
  Microsoft: 'phi',
  Mistral: 'bars',
  'Alibaba (community)': 'circle',
  Alibaba: 'circle',
}

function heroWordmark(model: Model): string {
  if (model.name.includes('GPT OSS')) return 'GPT OSS'
  if (model.name.includes('Gemma')) return 'GEMMA 4'
  if (model.name.includes('Phi')) return 'PHI-4'
  if (model.name.includes('Sushi')) return 'SUSHI'
  return model.name.replace(/\b(20B|24B|14B|9B|4B|3B)\b/g, '').trim().toUpperCase()
}

function buildSlides(): Slide[] {
  const preferred = ['gpt-oss-20b', 'gemma-4-e4b', 'phi-4-reasoning-plus', 'sushi-coder-9b', 'devstral-small']
  const groups = groupedModels(activeModels())
  const byKey = new Map(groups.map(group => [group.key, group]))
  const ordered = [
    ...preferred.map(key => byKey.get(key)).filter((group): group is ModelGroup => Boolean(group)),
    ...groups.filter(group => !preferred.includes(group.key)),
  ].slice(0, 5)

  return ordered.map((group, index) => ({
    name: group.key,
    wordmark: heroWordmark(group.primary),
    icon: group.primary.iconifyId,
    fallback: FALLBACK_BY_VENDOR[group.primary.vendor] ?? null,
    gradientFrom: 'var(--color-bg)',
    gradientTo: HERO_GRADIENTS[index % HERO_GRADIENTS.length],
    activeDot: HERO_DOTS[index % HERO_DOTS.length],
    model: group.primary,
    variants: group.variants,
  }))
}

export function HeroCarousel() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const hoverRef = useRef<HTMLDivElement | null>(null)
  const slides = buildSlides()
  const navigate = useNavigate()

  // auto-advance; pause on hover; reset progress when slide changes
  useEffect(() => {
    if (paused) return
    const id = setTimeout(() => setIdx(i => (i + 1) % slides.length), SLIDE_DURATION_MS)
    return () => clearTimeout(id)
  }, [idx, paused])

  const next = () => setIdx(i => (i + 1) % slides.length)
  const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length)
  const slide = slides[idx]

  const handleWheel = (e: React.WheelEvent) => {
    // Only capture distinct horizontal scroll events
    if (Math.abs(e.deltaX) > 50 && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (e.deltaX > 0) next()
      else prev()
    }
  }

  return (
    <section
      ref={hoverRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onWheel={handleWheel}
      className="relative overflow-hidden"
    >
      <div className="relative h-[clamp(420px,68vh,736px)] sm:h-[clamp(520px,80vh,736px)] isolate">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slide.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 grid place-items-center px-6 sm:px-10 lg:px-20 pt-20 sm:pt-24 cursor-pointer"
            style={{ background: `linear-gradient(180deg, ${slide.gradientFrom} 0%, ${slide.gradientTo} 100%)` }}
            onClick={() => navigate(`/models/${slide.model.slug}`)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="flex flex-col sm:flex-row items-center gap-6 sm:gap-[clamp(42px,6vw,76px)] text-white select-none pointer-events-none text-center sm:text-left"
            >
              <Glyph slide={slide} />
              <span className="font-headline tracking-[0.04em] uppercase leading-none sm:whitespace-nowrap text-[clamp(56px,14vw,180px)]">
                {slide.wordmark}
              </span>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={prev}
          aria-label="Previous slide"
          className="hidden sm:grid absolute top-1/2 -translate-y-1/2 left-5 w-14 h-20 md:w-20 md:h-24 place-items-center text-white z-10 hover:scale-110 transition-transform"
        >
          <Chevron dir="left" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="hidden sm:grid absolute top-1/2 -translate-y-1/2 right-5 w-14 h-20 md:w-20 md:h-24 place-items-center text-white z-10 hover:scale-110 transition-transform"
        >
          <Chevron dir="right" />
        </button>

        {/* Bullets — ghost (outlined) when inactive, solid coloured pill when active.
            The visible bullet is small but the <button> hit target is padded up to
            44px so touch users can hit it reliably. */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 sm:bottom-6 flex items-center gap-1 sm:gap-2 z-10">
          {slides.map((s, i) => {
            const isActive = i === idx
            return (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Go to slide ${i + 1}: ${s.wordmark}`}
                aria-current={isActive ? 'true' : undefined}
                className="grid place-items-center w-11 h-11 group/dot"
              >
                <span
                  className={[
                    'rounded-full transition-all duration-300 ring-1 ring-inset',
                    isActive
                      ? 'h-3 w-10 ring-white/10'
                      : 'h-3 w-3 bg-white/0 ring-white/70 group-hover/dot:bg-white/30 group-hover/dot:ring-white',
                  ].join(' ')}
                  style={isActive ? { backgroundColor: s.activeDot } : undefined}
                />
              </button>
            )
          })}
        </div>

        {/* Constant Loadbar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-20">
          <motion.div
            key={idx}
            className="absolute top-0 left-0 bottom-0"
            style={{ backgroundColor: slide.activeDot }}
            initial={{ width: 0 }}
            animate={{ width: paused ? undefined : '100%' }}
            transition={{ duration: SLIDE_DURATION_MS / 1000, ease: 'linear' }}
          />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 right-12 text-white font-mono text-[11px] tracking-widest uppercase flex flex-col items-center gap-2 opacity-60 z-10 hidden lg:flex">
          <span style={{ writingMode: 'vertical-rl' }}>Scroll</span>
          <motion.div 
            className="w-px h-8 bg-white"
            animate={{ scaleY: [0, 1, 0], translateY: [0, 10, 20] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Cross-pattern band that fades into the next section */}
      <div
        className="bg-cross-pattern h-44 -mt-px"
        style={{
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 100%)',
        }}
        aria-hidden
      />
    </section>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="72" height="116" viewBox="0 0 32 56" fill="none" stroke="#f5f8ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      {dir === 'left' ? <polyline points="22,6 6,28 22,50" /> : <polyline points="10,6 26,28 10,50" />}
    </svg>
  )
}

type FallbackKind = 'star' | 'phi' | 'bars' | 'circle' | null

/**
 * Hero glyph — pulls the official mark from Iconify (`simple-icons:` collection,
 * monochrome, recolored white via currentColor). Renders an inline-SVG fallback
 * during the brief async fetch so the layout never collapses.
 */
function Glyph({ slide }: { slide: Slide }) {
  const wrap = 'w-[clamp(150px,18vw,256px)] h-[clamp(150px,18vw,256px)] text-white opacity-95 shrink-0'
  return (
    <div className={wrap}>
      <BrandIcon model={slide.model} icon={slide.icon} className="w-full h-full" aria-hidden />
    </div>
  )
}
