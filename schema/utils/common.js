const getEmptyConnection = () => {
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
  getEmptyConnection,
  pathExists
}
