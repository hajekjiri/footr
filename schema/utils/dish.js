const {
  ApolloError,
  UserInputError
} = require('apollo-server')
const mongoose = require('mongoose')
const {
  getEmptyConnection
} = require('./common')
const Dish = require('../../models/dish')
const Record = require('../../models/record')

const getDishes = async (args) => {
  if (!args.first && !args.last) {
    throw new UserInputError('You must specify the "first" or "last" parameter to properly paginate the results.', 'BAD_PAGINATION')
  }
  if (args.first && args.last) {
    throw new ApolloError('You cannot mix "first" and "last" parameters.', 'BAD_PAGINATION')
  }
  if (args.first && (args.first < 1 || args.first > 100)) {
    throw new ApolloError('The "first" value must be between 1 and 100 (inclusive).', 'BAD_PAGINATION')
  }
  if (args.last && (args.last < 1 || args.last > 100)) {
    throw new ApolloError('The "last" value must be between 1 and 100 (inclusive).', 'BAD_PAGINATION')
  }
  if (args.before) {
    const cursor = async () => await Dish.findById(args.before)
    if (!mongoose.Types.ObjectId.isValid(args.before) || !(await cursor())) {
      throw new ApolloError(`"before" value "${args.before}" is not a valid cursor.`, 'BAD_PAGINATION')
    }
  }
  if (args.after) {
    const cursor = async () => await Dish.findById(args.after)
    if (!mongoose.Types.ObjectId.isValid(args.after) || !(await cursor())) {
      throw new ApolloError(`"after" value "${args.after}" is not a valid cursor.`, 'BAD_PAGINATION')
    }
  }

  const result = getEmptyConnection()
  result.totalCount = Dish.estimatedDocumentCount()

  const options = {}
  if (args.before) {
    options._id = { $lt: args.before }
  }
  if (args.after) {
    if (!('_id' in options)) {
      options._id = {}
    }
    options._id.$gt = args.after
  }
  let dishes
  if (args.first) {
    dishes = await Dish.find().where(options).sort({ _id: 1 }).limit(args.first)
  } else {
    dishes = await Dish.find().where(options).sort({ _id: -1 }).limit(args.last)
  }

  if (dishes.length === 0) {
    return result
  }
  const before = await Dish.findOne().where({ _id: { $lt: dishes[0]._id } })
  const after = await Dish.findOne().where({ _id: { $gt: dishes.slice(-1)[0] } })
  result.pageInfo.hasPreviousPage = !!before
  result.pageInfo.hasNextPage = !!after
  result.pageInfo.startCursor = dishes[0]._id
  result.pageInfo.endCursor = dishes.slice(-1)[0]._id

  for (const dish of dishes) {
    result.edges.push({ cursor: dish._id, node: { id: dish._id, name: dish.name } })
  }

  return result
}

const getAndRemoveSingleDishByIdOrName = async (id, name) => {
  if (!id && !name) {
    throw new ApolloError('You must provide an id or a name of the dish you want to remove.')
  }
  if (id && name) {
    throw new ApolloError('You cannot combine id and name parameters.')
  }

  let dish
  if (id) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      dish = await Dish.findByIdAndRemove(id)
    } else {
      dish = null
    }
    if (dish === null) {
      throw new ApolloError(`Couldn't find dish with id "${id}".`, 'NOT_FOUND')
    }
  } else {
    dish = await Dish.findOneAndRemove({ name: name })
    if (dish === null) {
      throw new ApolloError(`Couldn't find dish with name "${name}".`, 'NOT_FOUND')
    }
  }

  const result = {
    id: dish._id,
    name: dish.name
  }
  return result
}

const getSingleDishByIdOrName = async (id, name) => {
  if (!id && !name) {
    throw new UserInputError('You must provide an id or a name of the dish you want to query.')
  }
  if (id && name) {
    throw new UserInputError('You cannot combine id and name parameters.')
  }

  let dish
  if (id) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      dish = await Dish.findById(id)
    } else {
      dish = null
    }
  } else {
    dish = await Dish.findOne({ name: name })
  }

  if (dish === null) {
    if (id) {
      throw new ApolloError(`Couldn't find dish with id "${id}".`, 'NOT_FOUND')
    }
    throw new ApolloError(`Couldn't find dish with name "${name}".`, 'NOT_FOUND')
  }

  const result = {
    id: dish._id,
    name: dish.name
  }
  return result
}

const giveSingleDishRecords = async (result) => {
  const dishRecords = await getDishRecords([result.id])
  result.records = dishRecords[result.id]
  if (result.records.edges.length !== 0) {
    result.lastEaten = result.records.edges.slice(-1)[0].node.day
  } else {
    result.lastEaten = null
  }
}

const giveDishesRecords = async (result) => {
  const dishRecords = await getDishRecords(result.edges.map(x => x.node.id))
  for (const dish of result.edges) {
    dish.node.records = dishRecords[dish.node.id]
    if (dish.node.records.edges.length !== 0) {
      dish.node.lastEaten = dish.node.records.edges.slice(-1)[0].node.day
    } else {
      result.lastEaten = null
    }
  }
}

const getDishRecords = async (dishIds) => {
  const result = {}
  for (const dishId of dishIds) {
    result[dishId] = getEmptyConnection()
  }

  const records = await Record.find().sort({ day: 1 }).in('dishes', dishIds)
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
  getAndRemoveSingleDishByIdOrName,
  getDishes,
  getDishRecords,
  getSingleDishByIdOrName,
  giveDishesRecords,
  giveSingleDishRecords
}
