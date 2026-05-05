import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, createReadStream, readdirSync, copyFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(readFileSync('./package.json', 'utf8'))

// Serves ../assests/animal/ at /animal/ in dev and copies to dist/animal/ on build.
// Files are never bundled or hashed — the browser only downloads a file when a
// <source src="/animal/xxx.mp4"> element is inserted into the DOM.
function animalAssets() {
  const src = resolve(__dirname, '../assests/animal')
  return {
    name: 'animal-assets',
    configureServer(server) {
      server.middlewares.use('/animal', (req, res, next) => {
        const filename = req.url.replace(/^\//, '')
        if (!filename) { next(); return }
        const file = join(src, filename)
        const ext  = filename.split('.').pop().toLowerCase()
        const mime = { mp4: 'video/mp4', gif: 'image/gif', jpg: 'image/jpeg', jpeg: 'image/jpeg' }[ext] ?? 'application/octet-stream'
        const stream = createReadStream(file)
        stream.on('error', next)
        res.setHeader('Content-Type', mime)
        stream.pipe(res)
      })
    },
    closeBundle() {
      const dest = resolve(__dirname, 'dist/animal')
      if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
      for (const f of readdirSync(src)) {
        copyFileSync(join(src, f), join(dest, f))
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), animalAssets()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
})
