const express  = require('express')
const router   = express.Router()
const supabase = require('../supabase')

// GET comments for a post
router.get('/:postId', async (req, res) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', req.params.postId)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST add a comment
router.post('/', async (req, res) => {
  const { user_id, post_id, username, content } = req.body

  if (!content) return res.status(400).json({ error: 'Comment cannot be empty' })

  const { data, error } = await supabase
    .from('comments')
    .insert([{ user_id, post_id, username, content }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

module.exports = router