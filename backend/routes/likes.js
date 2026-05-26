const express = require('express')
const router = express.Router()

// GET likes count for a post
router.get('/:postId', async (req, res) => {
  const { data, error, count } = await req.db
    .from('likes')
    .select('*', { count: 'exact' })
    .eq('post_id', req.params.postId)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ likes: count, users: data })
})

// POST like a post
router.post('/', async (req, res) => {
  const { user_id, post_id } = req.body

  const { data, error } = await req.db
    .from('likes')
    .insert([{ user_id, post_id }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE unlike a post
router.delete('/', async (req, res) => {
  const { user_id, post_id } = req.body

  const { error } = await req.db
    .from('likes')
    .delete()
    .eq('user_id', user_id)
    .eq('post_id', post_id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

module.exports = router