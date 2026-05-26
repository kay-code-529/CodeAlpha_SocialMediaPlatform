const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_KEY

// base anon client, used for public reads
const supabase = createClient(url, key)

// build a client that carries the caller's JWT so RLS sees auth.uid()
function clientFromToken(token) {
  return createClient(url, key, {
    global: { headers: token ? { Authorization: 'Bearer ' + token } : {} },
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

module.exports = { supabase, clientFromToken }
