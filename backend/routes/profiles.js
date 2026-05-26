const express  = require('express')
const router   = express.Router()
const supabase = require('../supabase')

// GET profile by user id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'Profile not found' })
  res.json(data)
})

// POST create profile
router.post('/', async (req, res) => {
  const { id, username, bio, avatar_url } = req.body

  const { data, error } = await supabase
    .from('profiles')
    .insert([{ id, username, bio, avatar_url }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// PUT update profile
router.put('/:id', async (req, res) => {
  const { username, bio, avatar_url } = req.body

  const { data, error } = await supabase
    .from('profiles')
    .update({ username, bio, avatar_url })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router