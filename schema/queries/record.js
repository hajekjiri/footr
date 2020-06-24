const {
  pathExists
} = require('../utils/common')
const {
  giveDishesRecords
} = require('../utils/dish')
const {
  getSingleRecordByIdOrDay
} = require('../utils/record')

const records = async (_, args, __, info) => {
  const wantsDishes = pathExists(
    info.fieldNodes,
    ['record', 'dishes']
  )
  let wantsDishRecords = pathExists(
    info.fieldNodes,
    ['record', 'dishes', 'edges', 'node', 'records']
  )
  const wantsLastEaten = pathExists(
    info.fieldNodes,
    ['record', 'dishes', 'edges', 'node', 'lastEaten']
  )
  if (wantsLastEaten) {
    wantsDishRecords = true
  }

  const result = await getSingleRecordByIdOrDay(args.id, args.day, wantsDishes)
  if (wantsDishRecords) {
    await giveDishesRecords(result.dishes)
  }
  return result
}

module.exports = records
