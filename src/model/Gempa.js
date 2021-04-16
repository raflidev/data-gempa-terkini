const mongoose = require('mongoose')

const Gempa = new mongoose.Schema({
    ambil_data: String,
      jam: String,
      detail: {
        wilayah: String,
        koordinat: String,
        bujur: String,
        lintang: String,
        map: String
      }
})

module.exports = mongoose.model('gempa',Gempa)