const Dish = require('../../models/dish')
const {
  getEmptyConnection
} = require('../utils/common')

const addDish = async (parent, args) => {
  const dish = new Dish({
    name: args.input.name
  })
  await dish.save()

  const result = {
    id: dish._id,
    name: dish.name,
    lastEaten: null,
    records: getEmptyConnection()
  }

  return result
}

module.exports = addDish
