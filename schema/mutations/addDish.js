const Dish = require('../../models/dish')

const addDish = async (parent, args) => {
  const dish = new Dish({
    name: args.input.name
  })
  await dish.save()

  const result = {
    id: dish._id,
    name: dish.name,
    lastEaten: null,
    records: {
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

  return result
}

module.exports = addDish
