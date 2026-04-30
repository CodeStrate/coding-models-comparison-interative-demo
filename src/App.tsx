import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Models } from './pages/Models'
import { ModelDetail } from './pages/ModelDetail'
import { Blog } from './pages/Blog'
import { DocReader } from './pages/DocReader'
import { Agentic } from './pages/Agentic'
import { Rubrics } from './pages/Rubrics'
import { Leaderboard } from './pages/Leaderboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="models" element={<Models />} />
          <Route path="models/:slug" element={<ModelDetail />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<DocReader />} />
          <Route path="docs/:slug" element={<DocReader />} />
          <Route path="deliberations/:slug" element={<DocReader />} />
          <Route path="agentic" element={<Agentic />} />
          <Route path="rubrics" element={<Rubrics />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24">
      <div className="inline-flex items-center font-mono text-sm font-semibold tracking-wide border border-ink rounded px-3 py-2 mb-6">
        404
      </div>
      <h1 className="text-3xl font-bold mb-2">Lost the thread.</h1>
      <p className="font-mono text-xs text-[color:var(--color-ink-faint)]">No deliberation here. Try the leaderboard.</p>
    </div>
  )
}
