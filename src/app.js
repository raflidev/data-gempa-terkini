const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const axios = require('axios')
var convert = require('xml-js');
var moment = require('moment')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

const adapter = new FileAsync('db.json')

var CronJob = require('cron').CronJob;


app.use(express.json())

low(adapter).then(db => {
    var job = new CronJob('*/30 * * * *', async function() {

        const data = await axios.get("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.xml")
        const result = convert.xml2json(data.data, {compact: true, spaces: 4});
        const info = JSON.parse(result)
        db.get('gempa')
        .push(
         {
            "ambil_data":moment().format('MMMM Do YYYY, h:mm:ss a'),
            "jam":info.Infogempa.gempa.Tanggal._text + " " + info.Infogempa.gempa.Jam._text,
            "detail": {
                wilayah:info.Infogempa.gempa.Wilayah._text,
                koordinat:info.Infogempa.gempa.point.coordinates._text,
                bujur:info.Infogempa.gempa.Bujur._text,
                lintang:info.Infogempa.gempa.Lintang._text,
                map:info.Infogempa.gempa.Shakemap._text
            }
         }
        )
        .write()
      }, null, true, 'America/Los_Angeles');
      job.start();
  

    app.get("/", (req,res) => {
        const gempa = db.get('gempa').value()
        res.send(gempa)
    })
    app.get('/posts', (req,res) => {
        const post = db.get('gempa')
            .value()
          res.send(post)
    })


})

app.listen(PORT, () =>{
    console.log(`Server berjalan di http://localhost:${PORT}`);
})