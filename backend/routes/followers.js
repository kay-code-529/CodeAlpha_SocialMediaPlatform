const express = require('express')
const router = express.Router()

// GET followers of a user
router.get('/:userId', async (req, res) => {
  const { data, error } = await req.db
    .from('followers')
    .select('*')
    .eq('following_id', req.params.userId)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ followers: data.length, data })
})

// POST follow a user
router.post('/', async (req, res) => {
  const { follower_id, following_id } = req.body

  const { data, error } = await req.db
    .from('followers')
    .insert([{ follower_id, following_id }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE unfollow a user
router.delete('/', async (req, res) => {
  const { follower_id, following_id } = req.body

  const { error } = await req.db
    .from('followers')
    .delete()
    .eq('follower_id', follower_id)
    .eq('following_id', following_id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

module.exports = router