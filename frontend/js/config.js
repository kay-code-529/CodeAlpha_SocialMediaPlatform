const SUPABASE_URL = 'https://uovpiugnyiraxblooaph.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdnBpdWdueWlyYXhibG9vYXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4MzY4MDQsImV4cCI6MjA5NDQxMjgwNH0.oI6T3UyfdY5H_X7_Q9hJhgu3UF1cJAB3HYyWdF_E3No'

const API = '/api'

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function currentUser() {
  const { data } = await sb.auth.getUser()
  return data.user || null
}

async function requireAuth() {
  const user = await currentUser()
  if (!user) {
    window.location.href = 'login.html'
    return null
  }
  return user
}

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Request failed')
  return body
}

function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  if (s < 86400) return Math.floor(s / 3600) + 'h'
  return Math.floor(s / 86400) + 'd'
}
