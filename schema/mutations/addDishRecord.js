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

const addRecord = async (_, args, __, info) => {
  const wantsDishes = pathExists(
    info.fieldNodes,
    ['addRecord', 'dishes']
  )
  let wantsDishRecords = pathExists(
    info.fieldNodes,
    ['addRecord', 'dishes', 'edges', 'node', 'records']
  )
  const wantsLastEaten = pathExists(
    info.fieldNodes,
    ['addRecord', 'dishes', 'edges', 'node', 'lastEaten']
  )
  if (wantsLastEaten) {
    wantsDishRecords = true
  }

  let record = await Record.findOne({ day: args.input.day })
  if (record !== null) {
    const containsDish = record.dishes.some(x => x.toString() === args.input.dishId)
    if (containsDish) {
      throw new ApolloError(`A record with day "${args.input.day.toISOString().slice(0, 10)}" and dish ID "${args.input.dishId}" already exists.`, 'ALREADY_EXISTS')
    }
    await record.updateOne({ $push: { dishes: args.input.dishId } })
  } else {
    record = new Record({ day: args.input.day, dishes: [args.input.dishId] })
    await record.save()
  }

  const result = await getSingleRecordByIdOrDay(null, args.input.day, wantsDishes)
  if (wantsDishRecords) {
    await giveDishesRecords(result.dishes)
  }
  return result
}

module.exports = addRecord
