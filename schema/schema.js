const { gql, ApolloError, UserInputError } = require('apollo-server')
const { GraphQLDate } = require('graphql-iso-date')
const mongoose = require('mongoose')

const Dish = require('../models/dish')
const Record = require('../models/record')

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

  type Query {
    records(first: Int, last: Int, before: String, after: String): RecordConnection!
    dishes(first: Int, last: Int, before: String, after: String): DishConnection!
    dish(id: ID, name: String): Dish
  }

  type Mutation {
    addDish(input: DishInput!): Dish
    removeDish(id: ID, name: String): Dish
  }
`

const resolvers = {
  Date: GraphQLDate,
  Query: {
    records: async (parent, args, context, info) => {
      const wantsDishes = pathExists(
        info.fieldNodes,
        ['records', 'edges', 'node', 'dishes']
      )
      const wantsDishRecords = pathExists(
        info.fieldNodes,
        ['records', 'edges', 'node', 'dishes', 'edges', 'node', 'records']
      )

      let records
      if (wantsDishes) {
        records = await Record.find().populate('dishes')
      } else {
        records = await Record.find()
      }

      const result = {
        edges: [],
        totalCount: 0,
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false
        }
      }

      if (records.length === 0) {
        return result
      }

      result.totalCount = records.length
      result.pageInfo.startCursor = records[0]._id
      result.pageInfo.endCursor = records.slice(-1)[0]._id

      const dishSet = new Set()
      for (const record of records) {
        const elem = {
          id: record._id,
          day: record.day,
          dishes: {
            edges: [],
            totalCount: 0,
            pageInfo: {
              startCursor: null,
              endCursor: null,
              hasPreviousPage: false,
              hasNextPage: false
            }
          }
        }

        if (record.dishes.length === 0) {
          continue
        }

        elem.dishes.totalCount = record.dishes.length
        elem.dishes.pageInfo.startCursor = record.dishes[0]._id
        elem.dishes.pageInfo.endCursor = record.dishes.slice(-1)[0]._id

        for (const dish of record.dishes) {
          elem.dishes.edges.push({ cursor: dish._id, node: { id: dish._id, name: dish.name } })
          dishSet.add(dish._id)
        }
        result.edges.push({ cursor: elem.id, node: elem })
      }

      if (wantsDishRecords) {
        const dishRecords = await getRecords(Array.from(dishSet))

        for (const record of result.edges) {
          for (const dish of record.node.dishes.edges) {
            dish.node.records = dishRecords[dish.node.id]
          }
        }
      }

      return result
    },
    dishes: async (parent, args, context, info) => {
      const wantsDishRecords = pathExists(
        info.fieldNodes,
        ['dishes', 'edges', 'node', 'records']
      )

      const dishes = await Dish.find()
      const result = {
        edges: [],
        totalCount: 0,
        pageInfo: {
          startCursor: null,
          endCursor: null,
          hasPreviousPage: false,
          hasNextPage: false
        }
      }

      if (dishes.length === 0) {
        return result
      }

      result.totalCount = dishes.length
      result.pageInfo.startCursor = dishes[0]._id
      result.pageInfo.endCursor = dishes.slice(-1)[0]._id

      for (const dish of dishes) {
        result.edges.push({ cursor: dish._id, node: { id: dish._id, name: dish.name } })
      }

      if (wantsDishRecords) {
        const dishRecords = await getRecords(dishes.map(x => x._id))

        for (const dish of result.edges) {
          dish.node.records = dishRecords[dish.node.id]
        }
      }

      return result
    },
    dish: async (parent, args, context, info) => {
      if (args.id === undefined && args.name === undefined) {
        throw new UserInputError('You must provide an id or a name of the dish you want to query.')
      }

      if (args.id !== undefined && args.name !== undefined) {
        throw new UserInputError('You cannot combine id and name parameters.')
      }

      const wantsDishRecords = pathExists(
        info.fieldNodes,
        ['dish', 'records']
      )

      let dish
      if (args.id !== undefined) {
        if (mongoose.Types.ObjectId.isValid(args.id)) {
          dish = await Dish.findById(args.id)
        } else {
          dish = null
        }
      } else {
        dish = await Dish.findOne({ name: args.name })
      }

      if (dish === null) {
        if (args.id !== undefined) {
          throw new ApolloError(`Couldn't find dish with id "${args.id}".`)
        }
        throw new ApolloError(`Couldn't find dish with name "${args.name}".`)
      }

      const result = {
        id: dish._id,
        name: dish.name
      }

      if (wantsDishRecords) {
        const dishRecords = await getRecords([dish._id])
        result.records = dishRecords[dish._id]
      }

      return result
    }
  },
  Mutation: {
    addDish: async (parent, args) => {
      const dish = new Dish({
        name: args.input.name
      })
      await dish.save()

      const result = {
        id: dish._id,
        name: dish.name,
        records: {
          edges: [],
          totalCount: 0,
          pageInfo: {
            startCursor: null,
            endCursor: null,
            hasPreviousPage: false,
            hasNextPage: false
          }
        }
      }

      return result
    },
    removeDish: async (parent, args, context, info) => {
      if (args.id === undefined && args.name === undefined) {
        throw new ApolloError('You must provide an id or a name of the dish you want to remove.')
      }

      if (args.id !== undefined && args.name !== undefined) {
        throw new ApolloError('You cannot combine id and name parameters.')
      }

      const wantsDishRecords = pathExists(
        info.fieldNodes,
        ['removeDish', 'records']
      )

      let dish
      if (args.id !== undefined) {
        dish = await Dish.findByIdAndRemove(args.id)
        if (dish === null) {
          throw new ApolloError(`Couldn't find dish with id "${args.id}".`, 'NOT FOUND')
        }
      } else {
        dish = await Dish.findOneAndRemove({ name: args.name })
        if (dish === null) {
          throw new ApolloError(`Couldn't find dish with name "${args.name}".`, 'NOT FOUND')
        }
      }

      const result = {
        id: dish._id,
        name: dish.name
      }

      if (wantsDishRecords) {
        const dishRecords = await getRecords([dish._id])
        result.records = dishRecords[dish._id]
      }

      await Record.find().in('dishes', [dish._id]).update({ $pull: { dishes: dish._id } })

      return result
    }
  }
}

const pathExists = (nodes, path) => {
  if (!nodes) {
    return false
  }

  const node = nodes.find(x => x.name.value === path[0])

  if (!node) {
    return false
  }

  if (path.length === 1) {
    return true
  }

  return pathExists(node.selectionSet.selections, path.slice(1))
}

const getRecords = async (dishIds) => {
  const result = {}
  for (const dishId of dishIds) {
    result[dishId] = {
      edges: [],
      totalCount: 0,
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  }

  const records = await Record.find().in('dishes', dishIds)

  if (records.length === 0) {
    return result
  }

  for (const record of records) {
    for (const dishId of record.dishes) {
      if (!(dishId in result)) {
        continue
      }

      result[dishId].edges.push({
        cursor: record._id,
        node: { id: record._id, day: record.day }
      })
    }
  }

  for (const dishId of dishIds) {
    if (result[dishId].edges.length === 0) {
      continue
    }

    result[dishId].totalCount = result[dishId].edges.length
    result[dishId].pageInfo.startCursor = result[dishId].edges[0].cursor
    result[dishId].pageInfo.endCursor = result[dishId].edges.slice(-1)[0].cursor
  }

  return result
}

module.exports = {
  typeDefs,
  resolvers
}
