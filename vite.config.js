import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ── In-memory registration store (lives in the Vite dev server process) ──────
const store = {
  tournois: {},      // id -> { nom, joueursParEq, eqMax, scoreCible }
  registrations: [], // { _id, _ts, tournoiId, nom, j1, j2, j3, empl }
}

function registrationApiPlugin() {
  return {
    name: 'registration-api',
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return }

        const rawPath = req.url.split('?')[0]
        const qs = req.url.includes('?') ? req.url.split('?')[1] : ''
        const params = new URLSearchParams(qs)

        const readBody = (cb) => {
          let body = ''
          req.on('data', (c) => { body += c })
          req.on('end', () => {
            try { cb(JSON.parse(body)) }
            catch { res.statusCode = 400; res.end(JSON.stringify({ error: 'Invalid JSON' })) }
          })
        }

        // PUT /api/tournoi/:id — organizer registers tournoi info
        if (req.method === 'PUT' && rawPath.startsWith('/tournoi/')) {
          const id = rawPath.replace('/tournoi/', '')
          readBody((data) => {
            store.tournois[id] = data
            res.end(JSON.stringify({ ok: true }))
          })
          return
        }

        // GET /api/tournoi/:id — participant fetches tournoi info
        if (req.method === 'GET' && rawPath.startsWith('/tournoi/')) {
          const id = rawPath.replace('/tournoi/', '')
          const t = store.tournois[id]
          if (!t) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Tournoi introuvable' })); return }
          res.end(JSON.stringify(t))
          return
        }

        // POST /api/register — participant submits inscription
        if (req.method === 'POST' && rawPath === '/register') {
          readBody((data) => {
            const tournoiInfo = store.tournois[String(data.tournoiId)]
            if (!tournoiInfo) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Tournoi introuvable' })); return }
            if (!data.nom || !data.j1) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Nom et Joueur 1 obligatoires' })); return }
            const dup = store.registrations.find(
              (r) => String(r.tournoiId) === String(data.tournoiId) && r.nom.toLowerCase() === data.nom.trim().toLowerCase()
            )
            if (dup) { res.statusCode = 409; res.end(JSON.stringify({ error: "Ce nom d'équipe est déjà en attente d'inscription" })); return }
            store.registrations.push({
              _id: Date.now() + Math.random(),
              _ts: Date.now(),
              tournoiId: data.tournoiId,
              nom: data.nom.trim(),
              j1: (data.j1 || '').trim(),
              j2: (data.j2 || '').trim(),
              j3: (data.j3 || '').trim(),
              empl: (data.empl || '').trim(),
            })
            res.end(JSON.stringify({ ok: true }))
          })
          return
        }

        // GET /api/registrations/:tournoiId?since=ts
        if (req.method === 'GET' && rawPath.startsWith('/registrations/')) {
          const tournoiId = rawPath.replace('/registrations/', '')
          const since = Number(params.get('since') || 0)
          const regs = store.registrations.filter(
            (r) => String(r.tournoiId) === tournoiId && r._ts > since
          )
          res.end(JSON.stringify(regs))
          return
        }

        // DELETE /api/registrations — organizer claims registrations after import
        if (req.method === 'DELETE' && rawPath === '/registrations') {
          readBody(({ ids }) => {
            store.registrations = store.registrations.filter((r) => !ids.includes(r._id))
            res.end(JSON.stringify({ ok: true }))
          })
          return
        }

        res.statusCode = 404
        res.end(JSON.stringify({ error: 'Not found' }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), registrationApiPlugin()],
  server: {
    host: true, // Expose on local network so participants can connect via WiFi
  },
})
