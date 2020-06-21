const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLError,
  GraphQLInputObjectType
} = require('graphql')

const {
  GraphQLDate
} = require('graphql-iso-date')

const mongoose = require('mongoose')

const Dish = require('../models/dish')
const Record = require('../models/record')

const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: () => ({
    startCursor: { type: GraphQLString },
    endCursor: { type: GraphQLString },
    hasPreviousPage: { type: GraphQLBoolean },
    hasNextPage: { type: GraphQLBoolean }
  })
})

const RecordConnectionType = new GraphQLObjectType({
  name: 'RecordConnection',
  fields: () => ({
    edges: { type: new GraphQLList(RecordEdgeType) },
    totalCount: { type: GraphQLInt },
    pageInfo: { type: PageInfoType }
  })
})

const RecordEdgeType = new GraphQLObjectType({
  name: 'RecordEdge',
  fields: () => ({
    node: { type: RecordType },
    cursor: { type: GraphQLString }
  })
})

const RecordType = new GraphQLObjectType({
  name: 'Record',
  fields: () => ({
    id: { type: GraphQLID },
    day: { type: GraphQLDate },
    dishes: { type: DishConnectionType }
  })
})

const DishConnectionType = new GraphQLObjectType({
  name: 'DishConnection',
  fields: () => ({
    edges: { type: new GraphQLList(DishEdgeType) },
    totalCount: { type: GraphQLInt },
    pageInfo: { type: PageInfoType }
  })
})

const DishEdgeType = new GraphQLObjectType({
  name: 'DishEdge',
  fields: () => ({
    node: { type: DishType },
    cursor: { type: GraphQLString }
  })
})

const DishType = new GraphQLObjectType({
  name: 'Dish',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    records: { type: DishRecordConnectionType }
  })
})

const DishRecordConnectionType = new GraphQLObjectType({
  name: 'DishRecordConnection',
  fields: () => ({
    edges: { type: new GraphQLList(DishRecordEdgeType) },
    totalCount: { type: GraphQLInt },
    pageInfo: { type: PageInfoType }
  })
})

const DishRecordEdgeType = new GraphQLObjectType({
  name: 'DishRecordEdge',
  fields: () => ({
    node: { type: DishRecordType },
    cursor: { type: GraphQLString }
  })
})

const DishRecordType = new GraphQLObjectType({
  name: 'Day',
  fields: () => ({
    day: { type: GraphQLDate }
  })
})

const DishInputType = new GraphQLInputObjectType({
  name: 'DishInput',
  fields: () => ({
    name: { type: GraphQLString }
  })
})

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

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => ({
    records: {
      type: RecordConnectionType,
      args: {
        first: { type: GraphQLInt },
        last: { type: GraphQLInt },
        before: { type: GraphQLString },
        after: { type: GraphQLString }
      },
      resolve: async (parent, args, ctx, info) => {
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

        result.totalCount = records.length
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

            if (wantsDishRecords) {
              // TODO: dish records
            }
          }

          result.edges.push({ cursor: elem.id, node: elem })
        }
        return result
      }
    },
    dishes: {
      type: DishConnectionType,
      args: {
        first: { type: GraphQLInt },
        last: { type: GraphQLInt },
        before: { type: GraphQLString },
        after: { type: GraphQLString }
      },
      resolve: async (parent, args, ctx, info) => {
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

          if (wantsDishRecords) {
            // TODO: dish records
          }
        }

        return result
      }
    },
    dish: {
      type: DishType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString }
      },
      resolve: async (parent, args, ctx, info) => {
        if (args.id === undefined && args.name === undefined) {
          throw new GraphQLError('You must provide an id or a name of the dish you want to query.')
        }

        if (args.id !== undefined && args.name !== undefined) {
          throw new GraphQLError('You cannot combine id and name parameters.')
        }

        const wantsDishRecords = pathExists(
          info.fieldNodes,
          ['dish', 'edges', 'node', 'records']
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
            throw new GraphQLError(`Couldn't find dish with id "${args.id}".`)
          }
          throw new GraphQLError(`Couldn't find dish with name "${args.name}".`)
        }

        const result = {
          id: dish._id,
          name: dish.name
        }

        if (wantsDishRecords) {
          // TODO: dish records
        }

        return result
      }
    }
  })
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    addDish: {
      type: DishType,
      args: {
        input: { type: new GraphQLNonNull(DishInputType) }
      },
      resolve: async (parent, args) => {
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
      }
    },
    removeDish: {
      type: DishType,
      args: {
        id: { type: GraphQLID },
        name: { type: GraphQLString }
      },
      resolve: async (parent, args, ctx, info) => {
        if (args.id === undefined && args.name === undefined) {
          throw new GraphQLError('You must provide an id or a name of the dish you want to remove.')
        }

        if (args.id !== undefined && args.name !== undefined) {
          throw new GraphQLError('You cannot combine id and name parameters.')
        }

        const wantsDishRecords = pathExists(
          info.fieldNodes,
          ['dish', 'edges', 'node', 'records']
        )

        let dish
        if (args.id !== undefined) {
          dish = await Dish.findByIdAndRemove(args.id)
          if (dish === null) {
            throw new GraphQLError(`Couldn't find dish with id "${args.id}".`)
          }
        } else {
          dish = await Dish.findOneAndRemove({ name: args.name })
          if (dish === null) {
            throw new GraphQLError(`Couldn't find dish with name "${args.name}".`)
          }
        }

        const result = {
          id: dish._id,
          name: dish.name
        }

        if (wantsDishRecords) {
          // TODO: dish records
        }

        return result
      }
    }
  })
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
})
