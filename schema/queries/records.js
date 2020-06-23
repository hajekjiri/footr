const Record = require('../../models/record')
const { pathExists, getRecords } = require('../utils')

const records = async (parent, args, context, info) => {
  const wantsDishes = pathExists(
    info.fieldNodes,
    ['records', 'edges', 'node', 'dishes']
  )
  let wantsDishRecords = pathExists(
    info.fieldNodes,
    ['records', 'edges', 'node', 'dishes', 'edges', 'node', 'records']
  )
  const wantsLastEaten = pathExists(
    info.fieldNodes,
    ['records', 'edges', 'node', 'dishes', 'edges', 'node', 'lastEaten']
  )
  if (wantsLastEaten) {
    wantsDishRecords = true
  }

  let records
  if (wantsDishes) {
    records = await Record.find().sort({ day: 1 }).populate('dishes')
  } else {
    records = await Record.find().sort({ day: 1 })
  }

  const result = {
    edges: [],
    totalCount: 0,
    pageInfo: {
      startCursor: null,
      endCursor: null,
      hasPreviousPage: false,
      hasNextPage: false
    }
  }

  if (records.length === 0) {
    return result
  }

  result.totalCount = records.length
  result.pageInfo.startCursor = records[0]._id
  result.pageInfo.endCursor = records.slice(-1)[0]._id

  const dishSet = new Set()
  for (const record of records) {
    const elem = {
      id: record._id,
      day: record.day
    }

    if (wantsDishes) {
      elem.dishes = {
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

  if (wantsDishRecords) {
    const dishRecords = await getRecords(Array.from(dishSet))

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

  return result
}

module.exports = records
