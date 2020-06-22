const { ApolloError } = require('apollo-server')
const { pathExists, getRecords } = require('../utils')
const Record = require('../../models/record')

const removeRecord = async (parent, args, context, info) => {
  const wantsDishes = pathExists(
    info.fieldNodes,
    ['removeRecord', 'dishes']
  )
  let wantsDishRecords = pathExists(
    info.fieldNodes,
    ['removeRecord', 'dishes', 'edges', 'node', 'records']
  )
  const wantsLastEaten = pathExists(
    info.fieldNodes,
    ['removeRecord', 'dishes', 'edges', 'node', 'lastEaten']
  )
  if (wantsLastEaten) {
    wantsDishRecords = true
  }

  const query = await Record.findOne({ day: args.input.day })
    .in('dishes', [args.input.dishId])
    .updateOne({ $pull: { dishes: args.input.dishId } })

  if (query.nModified === 0) {
    throw new ApolloError(`Couldn't find record with day "${args.input.day.toISOString().slice(0, 10)}" and dishId "${args.input.dishId}".`, 'NOT FOUND')
  }

  const record = await Record.findOne({ day: args.input.day })
    .populate('dishes')

  if (record.dishes.length === 0) {
    await Record.deleteOne({ day: args.input.day })
    return null
  }

  const result = {
    id: record._id,
    day: record.day
  }

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

    result.dishes.totalCount = record.dishes.length
    result.dishes.startCursor = record.dishes[0]._id
    result.dishes.startCursor = record.dishes.slice(-1)[0]._id

    for (const dish of record.dishes) {
      result.dishes.edges.push({ cursor: dish._id, node: { id: dish._id, name: dish.name } })
    }
  }

  if (wantsDishRecords) {
    const dishRecords = await getRecords(record.dishes.map(x => x._id))

    for (const dish of result.dishes.edges) {
      dish.node.records = dishRecords[dish.node.id]
      if (dish.node.records.edges.length !== 0) {
        dish.node.lastEaten =
          dish.node.records.edges.slice(-1)[0].node.day
      } else {
        result.lastEaten = null
      }
    }
  }

  return result
}

module.exports = removeRecord
