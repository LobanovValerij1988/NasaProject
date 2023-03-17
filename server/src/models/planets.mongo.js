const mongoose = require('mongoose');

const planetShema = new mongoose.Schema({
  keplerName: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Planet', planetShema);