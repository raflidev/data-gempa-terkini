const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const axios = require('axios')
const cors = require('cors')
var convert = require('xml-js');
var moment = require('moment')
require("dotenv/config")

var CronJob = require('cron').CronJob;

app.use(cors())
app.use(express.json())

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true,useUnifiedTopology:true}, (req,res) => {
    console.log("connected to database");
});

const Gempa = require("./model/Gempa")


var job = new CronJob('*/10 * * * *', async function() {

const data = await axios.get("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.xml")
const result = convert.xml2json(data.data, {compact: true, spaces: 4});
const info = JSON.parse(result)
try{
    const dataGempa = new Gempa({
        "ambil_data":moment().format('MMMM Do YYYY, h:mm:ss a'),
        "jam":info.Infogempa.gempa.Tanggal._text + " " + info.Infogempa.gempa.Jam._text,
        "detail": {
            wilayah:info.Infogempa.gempa.Wilayah._text,
            koordinat:info.Infogempa.gempa.point.coordinates._text,
            bujur:info.Infogempa.gempa.Bujur._text,
            lintang:info.Infogempa.gempa.Lintang._text,
            map:info.Infogempa.gempa.Shakemap._text
        }
    })
    dataGempa.save()
}catch(err) {
    console.log({message: err});
}
}, null, true, 'America/Los_Angeles');
job.start();

app.get("/", async (req,res) => {
    res.send(await Gempa.find())
})

app.listen(PORT, () =>{
    console.log(`Server berjalan di http://localhost:${PORT}`);
})