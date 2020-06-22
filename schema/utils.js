const Record = require('../models/record')

const getRecords = async (dishIds) => {
  const result = {}
  for (const dishId of dishIds) {
    result[dishId] = {
      edges: [],
      totalCount: 0,
      pageInfo: {
        startCursor: null,
        endCursor: null,
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  }

  const records = await Record.find().in('dishes', dishIds)

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

const pathExists = (nodes, path) => {
  if (!nodes) {
    return false
  }

  const node = nodes.find(x => x.name.value === path[0])

  if (!node) {
    return false
  }

  if (path.length === 1) {
    return true
  }

  return pathExists(node.selectionSet.selections, path.slice(1))
}

module.exports = {
  getRecords,
  pathExists
}
