const {
  ApolloError,
  UserInputError
} = require('apollo-server')
const mongoose = require('mongoose')
const Record = require('../../models/record')
const {
  pathExists
} = require('../utils/common')
const {
  getDishRecords
} = require('../utils/dish')

const records = async (parent, args, context, info) => {
  if (args.id === undefined && args.day === undefined) {
    throw new UserInputError('You must provide an id or a name of the record you want to query.')
  }

  if (args.id !== undefined && args.day !== undefined) {
    throw new UserInputError('You cannot combine id and day parameters.')
  }

  const wantsDishes = pathExists(
    info.fieldNodes,
    ['record', 'dishes']
  )
  let wantsDishRecords = pathExists(
    info.fieldNodes,
    ['record', 'dishes', 'edges', 'node', 'records']
  )
  const wantsLastEaten = pathExists(
    info.fieldNodes,
    ['record', 'dishes', 'edges', 'node', 'lastEaten']
  )
  if (wantsLastEaten) {
    wantsDishRecords = true
  }

  let record
  if (args.id !== undefined) {
    if (mongoose.Types.ObjectId.isValid(args.id)) {
      if (wantsDishes) {
        record = await Record.findById(args.id).populate('dishes')
      } else {
        record = await Record.findById(args.id)
      }
    } else {
      record = null
    }
  } else {
    if (wantsDishes) {
      record = await Record.findOne({ day: args.day }).populate('dishes')
    } else {
      record = await Record.findOne({ day: args.day })
    }
  }

  if (record === null) {
    if (args.id !== undefined) {
      throw new ApolloError(`Couldn't find record with id "${args.id}".`)
    }
    throw new ApolloError(`Couldn't find record with day "${args.day.toISOString().slice(0, 10)}".`)
  }

  const result = {
    id: record._id,
    day: record.day
  }

  const dishIds = []
  if (wantsDishes) {
    result.dishes = {
      edges: [],
      totalCount: 0,
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasPreviousPage: false,
        hasNextPage: false
      }
    }

    if (record.dishes.length !== 0) {
      result.dishes.totalCount = record.dishes.length
      result.dishes.pageInfo.startCursor = record.dishes[0]._id
      result.dishes.pageInfo.endCursor = record.dishes.slice(-1)[0]._id

      for (const dish of record.dishes) {
        result.dishes.edges.push({ cursor: dish._id, node: { id: dish._id, name: dish.name } })
        dishIds.push(dish._id)
      }
    }
  }

  if (wantsDishRecords) {
    const dishRecords = await getDishRecords(dishIds)

    for (const dish of result.dishes.edges) {
      dish.node.records = dishRecords[dish.node.id]
      if (dish.node.records.edges.length !== 0) {
        dish.node.lastEaten =
          dish.node.records.edges.slice(-1)[0].node.day
      } else {
        dish.node.lastEaten = null
      }
    }
  }

  return result
}

module.exports = records
