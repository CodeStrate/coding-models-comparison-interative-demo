import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // App entry switch — public default points at App.tsx; private builds set
  // VITE_USE_DEVTOOLS=true and (when App.dev.tsx exists locally) get the
  // version with the /dev/* route mounted.
  const wantsDev = env.VITE_USE_DEVTOOLS === 'true'
  const devEntry = resolve(__dirname, 'src/App.dev.tsx')
  const publicEntry = resolve(__dirname, 'src/App.tsx')
  const appEntry = wantsDev && existsSync(devEntry) ? devEntry : publicEntry

  return {
    plugins: [
      react(),
      tailwindcss(),
      svgr({ include: '**/*.svg?react' }),
    ],
    resolve: {
      alias: {
        '~app': appEntry,
      },
    },
  }
})
