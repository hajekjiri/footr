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
  recordsResultMock,
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

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    records: {
      type: RecordConnectionType,
      args: {
        first: { type: GraphQLInt },
        last: { type: GraphQLInt },
        before: { type: GraphQLString },
        after: { type: GraphQLString }
      },
      resolve (parent, args) {
        return recordsResultMock
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
