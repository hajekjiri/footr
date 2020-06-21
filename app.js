const { ApolloServer } = require('apollo-server')
const { typeDefs, resolvers } = require('./schema/schema')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Read environment variables from .env
dotenv.config()

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once('open', () => {
  console.log('Connected to database')
})

// Start apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers
})
const PORT = process.env.PORT || 4000
server.listen({ port: PORT }).then(({ url }) => console.log(`Apollo Server ready at ${url}`))
