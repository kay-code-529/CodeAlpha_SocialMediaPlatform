const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()

app.use(cors({ origin: '*' }))
app.use(express.json())

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
