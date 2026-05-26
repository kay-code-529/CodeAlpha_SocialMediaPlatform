const express = require('express')
const cors = require('cors')
const path = require('path')
const { clientFromToken } = require('./supabase')
require('dotenv').config()

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

// give every API request a Supabase client scoped to the caller's token
app.use('/api', (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  req.db = clientFromToken(token)
  next()
})

app.use('/api/posts', require('./routes/posts'))
app.use('/api/comments', require('./routes/comments'))
app.use('/api/likes', require('./routes/likes'))
app.use('/api/followers', require('./routes/followers'))
app.use('/api/profiles', require('./routes/profiles'))

app.use(express.static(path.join(__dirname, '..', 'frontend')))

app.get('/api', (req, res) => {
  res.json({ message: 'Social Media API is working!' })
})

const PORT = process.env.PORT || 3000
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

module.exports = app
