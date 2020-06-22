const { ApolloError, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const Dish = require('../../models/dish')
const { getRecords, pathExists } = require('../utils')

const dish = async (parent, args, context, info) => {
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

module.exports = dish
