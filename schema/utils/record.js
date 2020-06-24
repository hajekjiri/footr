const {
  ApolloError,
  UserInputError
} = require('apollo-server')
const mongoose = require('mongoose')
const Record = require('../../models/record')
const {
  getEmptyConnection
} = require('./common')
const {
  getDishRecords
} = require('./dish')

const giveRecordsDishRecords = async (result, dishIds) => {
  const dishRecords = await getDishRecords(dishIds)
  for (const record of result.edges) {
    for (const dish of record.node.dishes.edges) {
      dish.node.records = dishRecords[dish.node.id]
      if (dish.node.records.edges.length !== 0) {
        dish.node.lastEaten =
          dish.node.records.edges.slice(-1)[0].node.day
      } else {
        dish.node.lastEaten = null
      }
    }
  }
}

const getRecords = async (wantsDishes) => {
  const result = getEmptyConnection()
  const dishSet = new Set()
  let records
  if (wantsDishes) {
    records = await Record.find().sort({ day: 1 }).populate('dishes')
  } else {
    records = await Record.find().sort({ day: 1 })
  }

  if (records.length === 0) {
    return result
  }
  result.totalCount = records.length
  result.pageInfo.startCursor = records[0]._id
  result.pageInfo.endCursor = records.slice(-1)[0]._id

  for (const record of records) {
    const elem = {
      id: record._id,
      day: record.day
    }

    if (wantsDishes) {
      elem.dishes = getEmptyConnection()

      if (record.dishes.length !== 0) {
        elem.dishes.totalCount = record.dishes.length
        elem.dishes.pageInfo.startCursor = record.dishes[0]._id
        elem.dishes.pageInfo.endCursor = record.dishes.slice(-1)[0]._id

        for (const dish of record.dishes) {
          elem.dishes.edges.push({ cursor: dish._id, node: { id: dish._id, name: dish.name } })
          dishSet.add(dish._id)
        }
      }
    }
    result.edges.push({ cursor: elem.id, node: elem })
  }

  const dishIds = Array.from(dishSet)
  return { result, dishIds }
}

const getSingleRecordByIdOrDay = async (id, day, wantsDishes) => {
  if (!id && !day) {
    throw new UserInputError('You must provide an id or a name of the record you want to query.')
  }
  if (id && day) {
    throw new UserInputError('You cannot combine id and day parameters.')
  }

  let record
  if (id) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      if (wantsDishes) {
        record = await Record.findById(id).populate('dishes')
      } else {
        record = await Record.findById(id)
      }
    } else {
      record = null
    }
  } else {
    if (wantsDishes) {
      record = await Record.findOne({ day: day }).populate('dishes')
    } else {
      record = await Record.findOne({ day: day })
    }
  }

  if (record === null) {
    if (id) {
      throw new ApolloError(`Couldn't find record with id "${id}".`, 'NOT_FOUND')
    }
    throw new ApolloError(`Couldn't find record with day "${day.toISOString().slice(0, 10)}".`, 'NOT_FOUND')
  }

  const result = {
    id: record._id,
    day: record.day
  }

  if (wantsDishes) {
    result.dishes = getEmptyConnection()

    if (record.dishes.length !== 0) {
      result.dishes.totalCount = record.dishes.length
      result.dishes.pageInfo.startCursor = record.dishes[0]._id
      result.dishes.pageInfo.endCursor = record.dishes.slice(-1)[0]._id

      for (const dish of record.dishes) {
        result.dishes.edges.push({ cursor: dish._id, node: { id: dish._id, name: dish.name } })
      }
    }
  }

  return result
}

module.exports = {
  getRecords,
  getSingleRecordByIdOrDay,
  giveRecordsDishRecords
}
