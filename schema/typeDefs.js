const { gql } = require('apollo-server')

const typeDefs = gql`
  scalar Date

  type PageInfo {
    startCursor: String
    endCursor: String
    hasPreviousPage: Boolean!
    hasNextPage: Boolean!
  }

  type RecordConnection {
    edges: [RecordEdge!]
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type RecordEdge {
    node: Record!
    cursor: String!
  }

  type Record {
    id: ID!
    day: Date!
    dishes(first: Int, last: Int, before: String, after: String): DishConnection!
  }

  type DishConnection {
    edges: [DishEdge!]
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type DishEdge {
    node: Dish!
    cursor: String!
  }

  type Dish {
    id: ID!
    name: String!
    lastEaten: Date
    records(first: Int, last: Int, before: String, after: String): DishRecordConnection!
  }

  type DishRecordConnection {
    edges: [DishRecordEdge!]
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type DishRecordEdge {
    node: DishRecord!
    cursor: String!
  }

  type DishRecord {
    id: ID!
    day: Date!
  }

  input DishInput {
    name: String!
  }

  input RecordInput {
    day: Date!
    dishId: ID!
  }

  type Query {
    records(first: Int, last: Int, before: String, after: String): RecordConnection!
    dishes(first: Int, last: Int, before: String, after: String): DishConnection!
    dish(id: ID, name: String): Dish!
  }

  type Mutation {
    addDish(input: DishInput!): Dish!
    removeDish(id: ID, name: String): Dish!
    addRecord(input: RecordInput!): Record!
    removeRecord(input: RecordInput!): Record
  }
`
module.exports = typeDefs
