const { gql } = require('apollo-server')
const { readFileSync } = require('fs')

const typeDefs = gql`${readFileSync('schema/schema.graphql').toString()}`

module.exports = typeDefs
