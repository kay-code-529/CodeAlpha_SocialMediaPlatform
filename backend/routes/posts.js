const express  = require('express')
const router   = express.Router()
const supabase = require('../supabase')

// GET all posts (newest first)
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// GET single post
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'Post not found' })
  res.json(data)
})

// GET posts by user
router.get('/user/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', req.params.userId)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST create a new post
router.post('/', async (req, res) => {
  const { user_id, username, content, image_url } = req.body

  if (!content) return res.status(400).json({ error: 'Content is required' })

  const { data, error } = await supabase
    .from('posts')
    .insert([{ user_id, username, content, image_url }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE a post
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', req.params.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

module.exports = router