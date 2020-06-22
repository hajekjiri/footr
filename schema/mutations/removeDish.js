const { ApolloError } = require('apollo-server')
const { getRecords, pathExists } = require('../utils')
const Dish = require('../../models/dish')
const Record = require('../../models/record')

const removeDish = async (parent, args, context, info) => {
  if (args.id === undefined && args.name === undefined) {
    throw new ApolloError('You must provide an id or a name of the dish you want to remove.')
  }

  if (args.id !== undefined && args.name !== undefined) {
    throw new ApolloError('You cannot combine id and name parameters.')
  }

  let wantsDishRecords = pathExists(
    info.fieldNodes,
    ['removeDish', 'records']
  )
  const wantsLastEaten = pathExists(
    info.fieldNodes,
    ['removeDish', 'lastEaten']
  )
  if (wantsLastEaten) {
    wantsDishRecords = true
  }

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

    if (result.records.edges.length !== 0) {
      result.lastEaten =
        result.records.edges[result.records.edges.length - 1].node.day
    } else {
      result.lastEaten = null
    }
  }

  await Record.find().in('dishes', [dish._id]).update({ $pull: { dishes: dish._id } })

  return result
}

module.exports = removeDish
