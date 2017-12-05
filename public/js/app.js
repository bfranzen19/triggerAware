var mongoose = require('mongoose')
var request = require('request')
var cheerio = require('cheerio')

mongoose.connect('mongodb://localhost:27017/TriggerAware', {useMongoClient:true}, function(mongooseErr) {
  if(mongooseErr) {console.log(mongooseErr)}
  else {console.log('mongoose ACTIVAAAATE!')}
})
mongoose.Promise = global.Promise

var MediaSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: true,
    unique:   true,
  },
  triggerType: {
    type:    String,
    required: true,
  },
  episodeNumber: {
    type:     String,
    required: false,
  },
  episodeName: {
    type:     String,
    required: false,
  },
  description: {
    type:     String,
    required: false,
  },
})

var MediaModel = mongoose.model('Media', MediaSchema)

// scrapes imdb for keyword
var keyword = 'murder'
var page = '1'

request(`http://www.imdb.com/search/keyword?keywords=${keyword}&sort=moviemeter,asc&mode=simple&page=${page}&ref_=kw_ref_key`, function(error,response,html) {
  var $ = cheerio.load(html)
  var a = $('span.lister-item-index').next()
  var titles = []
  $(a).each(function(i, link) {
    titles.push($(this).text().replace(/\n/g, '').trim().split('    '))
    // console.log(titles)
  })
  // console.log(titles.length)

  for(var i=0 ; i<titles.length ; i++) {
    MediaModel.create({title: titles[i], triggerType: `${keyword}`}, function(err,docs) {
      if(err) {
        console.log(err)
        return err
      } else {
        console.log('saved --- ', docs)
        return docs
      }
    })
  }
})
