const {
  ApolloError
} = require('apollo-server')
const Dish = require('../../models/dish')
const Record = require('../../models/record')
const {
  pathExists
} = require('../utils/common')
const {
  getAndRemoveSingleDishByIdOrName,
  giveSingleDishRecords
} = require('../utils/dish')

const removeDish = async (parent, args, context, info) => {
  let wantsDishRecords = pathExists(
    info.fieldNodes,
    ['removeDish', 'records']
  )
  const wantsLastEaten = pathExists(
    info.fieldNodes,
    ['removeDish', 'lastEaten']
  )
  if (wantsLastEaten) {
    wantsDishRecords = true
  }

  const result = await getAndRemoveSingleDishByIdOrName(args.id, args.name)
  if (wantsDishRecords) {
    await giveSingleDishRecords(result)
  }
  await Record.find().in('dishes', [result.id]).updateMany({ $pull: { dishes: result.id } })
  return result
}

module.exports = removeDish
