const {
  pathExists
} = require('../utils/common')
const {
  getDishes,
  giveDishesRecords
} = require('../utils/dish')

const dishes = async (parent, args, context, info) => {
  let wantsDishRecords = pathExists(
    info.fieldNodes,
    ['dishes', 'edges', 'node', 'records']
  )
  const wantsLastEaten = pathExists(
    info.fieldNodes,
    ['dishes', 'edges', 'node', 'lastEaten']
  )
  if (wantsLastEaten) {
    wantsDishRecords = true
  }

  const result = await getDishes()
  if (wantsDishRecords) {
    await giveDishesRecords(result)
  }
  return result
}

module.exports = dishes
