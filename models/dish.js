const mongoose = require('mongoose')

const DishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }
  },
  {
    collection: 'dishes'
  }
)

module.exports = mongoose.model('Dish', DishSchema)
