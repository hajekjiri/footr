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

const getRecords = async (wantsDishes, args) => {
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
    const cursor = async () => await Record.findById(args.before)
    if (!mongoose.Types.ObjectId.isValid(args.before) || !(await cursor())) {
      throw new ApolloError(`"before" value "${args.before}" is not a valid cursor.`, 'BAD_PAGINATION')
    }
  }
  if (args.after) {
    const cursor = async () => await Record.findById(args.after)
    if (!mongoose.Types.ObjectId.isValid(args.after) || !(await cursor())) {
      throw new ApolloError(`"after" value "${args.after}" is not a valid cursor.`, 'BAD_PAGINATION')
    }
  }

  const result = getEmptyConnection()
  result.totalCount = Record.estimatedDocumentCount()

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
  const dishSet = new Set()
  let records
  if (wantsDishes) {
    if (args.first) {
      records = await Record.find().where(options).sort({ _id: 1 })
        .limit(args.first).populate('dishes')
    } else {
      records = await Record.find().where(options).sort({ _id: -1 })
        .limit(args.last).populate('dishes')
      records.reverse()
    }
  } else {
    if (args.first) {
      records = await Record.find().where(options).sort({ _id: 1 })
        .limit(args.first)
    } else {
      records = await Record.find().where(options).sort({ _id: -1 })
        .limit(args.last)
      records.reverse()
    }
  }

  if (records.length === 0) {
    return result
  }
  const before = await Record.findOne().where({ _id: { $lt: records[0]._id } })
  const after = await Record.findOne().where({ _id: { $gt: records.slice(-1)[0] } })
  result.pageInfo.hasPreviousPage = !!before
  result.pageInfo.hasNextPage = !!after
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
