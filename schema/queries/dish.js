const {
  pathExists
} = require('../utils/common')
const {
  getSingleDishByIdOrName,
  giveSingleDishRecords
} = require('../utils/dish')

const dish = async (parent, args, context, info) => {
  let wantsDishRecords = pathExists(
    info.fieldNodes,
    ['dish', 'records']
  )
  const wantsLastEaten = pathExists(
    info.fieldNodes,
    ['dish', 'lastEaten']
  )
  if (wantsLastEaten) {
    wantsDishRecords = true
  }

  const result = await getSingleDishByIdOrName(args.id, args.name)
  if (wantsDishRecords) {
    await giveSingleDishRecords(result, result.id)
  }
  return result
}

module.exports = dish
