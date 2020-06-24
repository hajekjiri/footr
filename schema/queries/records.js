const {
  pathExists
} = require('../utils/common')
const {
  getRecords,
  giveRecordsDishRecords
} = require('../utils/record')

const records = async (_, args, ___, info) => {
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

  const { result, dishIds } = await getRecords(wantsDishes, args)
  if (wantsDishRecords) {
    await giveRecordsDishRecords(result, dishIds)
  }
  return result
}

module.exports = records
