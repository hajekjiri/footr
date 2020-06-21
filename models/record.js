const mongoose = require('mongoose')

const RecordSchema = new mongoose.Schema(
  {
    day: { type: Date, required: true, unique: true },
    dishes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dish' }], required: true }
  },
  {
    collection: 'records'
  }
)

module.exports = mongoose.model('Record', RecordSchema)
