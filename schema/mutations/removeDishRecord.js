const {
  ApolloError
} = require('apollo-server')
const Record = require('../../models/record')
const {
  pathExists
} = require('../utils/common')
const {
  giveDishesRecords
} = require('../utils/dish')
const {
  getSingleRecordByIdOrDay
} = require('../utils/record')

const removeDishRecord = async (_, args, __, info) => {
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
    throw new ApolloError(`Couldn't find record with day "${args.input.day.toISOString().slice(0, 10)}" and dishId "${args.input.dishId}".`, 'NOT_FOUND')
  }

  const result = await getSingleRecordByIdOrDay(null, args.input.day, wantsDishes)
  if (wantsDishRecords) {
    await giveDishesRecords(result.dishes)
  }
  return result
}

module.exports = removeDishRecord
