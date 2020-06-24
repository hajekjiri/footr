const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const typeDefs = require('./schema/typeDefs')
const resolvers = require('./schema/resolvers')

// Read environment variables from .env
dotenv.config()

if (!process.env.MONGODB_CONNECTION_STRING) {
  console.log('Error: MONGODB_CONNECTION_STRING is undefined.')
  process.exit(1)
}

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }
)
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
