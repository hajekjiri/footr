const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLList,
  GraphQLBoolean,
  GraphQLID,
  GraphQLNonNull,
  GraphQLError
} = require('graphql')

const {
  GraphQLDate
} = require('graphql-iso-date')

const {
  historyResultMock,
  dishesResultMock,
  dishResultMock
} = require('./mocks')

const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: () => ({
    startCursor: { type: GraphQLString },
    endCursor: { type: GraphQLString },
    hasPreviousPage: { type: GraphQLBoolean },
    hasNextPage: { type: GraphQLBoolean }
  })
})

const HistoryType = new GraphQLObjectType({
  name: 'History',
  fields: () => ({
    edges: { type: new GraphQLList(HistoryEdgeType) },
    totalCount: { type: GraphQLInt },
    pageInfo: { type: PageInfoType }
  })
})

const HistoryEdgeType = new GraphQLObjectType({
  name: 'HistoryEdge',
  fields: () => ({
    node: { type: HistoryNodeType },
    cursor: { type: GraphQLString }
  })
})

const HistoryNodeType = new GraphQLObjectType({
  name: 'HistoryNode',
  fields: () => ({
    databaseId: { type: GraphQLID },
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
    databaseId: { type: GraphQLID },
    name: { type: GraphQLString },
    history: { type: DishHistoryType }
  })
})

const DishHistoryType = new GraphQLObjectType({
  name: 'DishHistory',
  fields: () => ({
    edges: { type: new GraphQLList(DishHistoryEdgeType) },
    totalCount: { type: GraphQLInt },
    pageInfo: { type: PageInfoType }
  })
})

const DishHistoryEdgeType = new GraphQLObjectType({
  name: 'DishHistoryEdge',
  fields: () => ({
    node: { type: DishHistoryNodeType },
    cursor: { type: GraphQLString }
  })
})

const DishHistoryNodeType = new GraphQLObjectType({
  name: 'Day',
  fields: () => ({
    day: { type: GraphQLDate }
  })
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    history: {
      type: HistoryType,
      args: {
        first: { type: GraphQLInt },
        last: { type: GraphQLInt },
        before: { type: GraphQLString },
        after: { type: GraphQLString }
      },
      resolve (parent, args) {
        return historyResultMock
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
      resolve (parent, args) {
        return dishesResultMock
      }
    },
    dish: {
      type: DishType,
      args: {
        databaseId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve (parent, args) {
        if (!(args.databaseId in dishResultMock)) {
          throw new GraphQLError(`Database ID "${args.databaseId}" doesn't match any dishes`)
        }
        return dishResultMock[args.databaseId]
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery
})
