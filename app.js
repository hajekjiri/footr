const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema/schema')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Read environment variables from .env
dotenv.config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once('open', () => {
  console.log('Connected to database')
})

// Start express server
const app = express()
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
