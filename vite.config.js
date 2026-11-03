import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { orderedProjects } from './src/data/portfolio.js'

const SITE_URL = 'https://portfolio.bsandoz.fr'

// Génère sitemap.xml au build : accueil, une entrée par page projet, mentions légales
function sitemap() {
  return {
    name: 'sitemap',
    apply: 'build',
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10)
      const url = (path, priority, changefreq) =>
        `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
      const urls = [
        url('/', '1.0', 'monthly'),
        ...orderedProjects.map((p) => url(`/projets/${p.slug}`, p.featured ? '0.9' : '0.7', 'monthly')),
        url('/mentions-legales', '0.3', 'yearly'),
      ]
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), sitemap()],
})
