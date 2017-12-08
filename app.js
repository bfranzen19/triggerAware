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
    type:    Array,
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
var keyword = 'child-abuse'  // imdb search keyword
var page = '31'  // imdb results page number
var trigger = 'child abuse'  // pre-defined trigger type

/* scraping stuffz --- updates db by release date */
request(`http://www.imdb.com/search/keyword?keywords=${keyword}&sort=release_date,desc&mode=simple&page=${page}&ref_=kw_ref_key`, function(error,response,html) {
  var $ = cheerio.load(html)
  var a = $('span.lister-item-index').next()
  var titles = []
  $(a).each(function(i, link) {
    titles.push($(this).text().replace(/\n/g, '').trim().split('    '))
  })
  console.log(titles)

  for(let title of titles) {
    MediaModel.create(
      { title : title[0], triggerType : trigger },
      function(err,docs) {
      if(err) {
        // console.log(err.message, titles)
        MediaModel.update(
        { title : title[0] },
        { $addToSet : { triggerType : trigger } },
        function(err,docs) {
          if(err) {
          console.log(err)
          } else {
            console.log('saved --- ', docs)
            return docs
          }
        })
      } else {
        console.log('saved --- ', docs)
        return docs
      }
    })
  }
})
