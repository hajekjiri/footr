const { GraphQLDate } = require('graphql-iso-date')
const record = require('./queries/record')
const records = require('./queries/records')
const dishes = require('./queries/dishes')
const dish = require('./queries/dish')
const addDish = require('./mutations/addDish')
const removeDish = require('./mutations/removeDish')
const addDishRecord = require('./mutations/addDishRecord')
const removeDishRecord = require('./mutations/removeDishRecord')

const resolvers = {
  Date: GraphQLDate,
  Query: {
    record,
    records,
    dish,
    dishes
  },
  Mutation: {
    addDish,
    removeDish,
    addDishRecord,
    removeDishRecord
  }
}

module.exports = resolvers
