const Dish = require('../../models/dish')
const { getRecords, pathExists } = require('../utils')

const dishes = async (parent, args, context, info) => {
  const wantsDishRecords = pathExists(
    info.fieldNodes,
    ['dishes', 'edges', 'node', 'records']
  )

  const dishes = await Dish.find()
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

  if (dishes.length === 0) {
    return result
  }

  result.totalCount = dishes.length
  result.pageInfo.startCursor = dishes[0]._id
  result.pageInfo.endCursor = dishes.slice(-1)[0]._id

  for (const dish of dishes) {
    result.edges.push({ cursor: dish._id, node: { id: dish._id, name: dish.name } })
  }

  if (wantsDishRecords) {
    const dishRecords = await getRecords(dishes.map(x => x._id))

    for (const dish of result.edges) {
      dish.node.records = dishRecords[dish.node.id]
    }
  }

  return result
}

module.exports = dishes
