const { GraphQLDate } = require('graphql-iso-date')
const records = require('./queries/records')
const dishes = require('./queries/dishes')
const dish = require('./queries/dish')
const addDish = require('./mutations/addDish')
const removeDish = require('./mutations/removeDish')

const resolvers = {
  Date: GraphQLDate,
  Query: {
    records,
    dishes,
    dish
  },
  Mutation: {
    addDish,
    removeDish
  }
}

module.exports = resolvers
