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

const getDishes = async () => {
  const result = getEmptyConnection()
  const dishes = await Dish.find()
  if (dishes.length === 0) {
    return result
  }
  result.totalCount = dishes.length
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
