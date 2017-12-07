var express = require('express')
var mongoose = require('mongoose')
var emailType = require('mongoose-type-email')
var bodyParser = require('body-parser')


/* search */
var Fuse = require('fuse.js')

/* login */
var bcrypt = require('bcryptjs')
var sessionsModule = require('client-sessions')
var secrets = require('./secrets.js')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use(express.static('./public'))

/* sessions */
var sessionsMiddleware = sessionsModule({
  cookieName: 'TriggerAware',
  secret: secrets.cookieSecret,
  duration: 86400 * 1000 * 7,
  cookie: {
    httpOnly: true,
    secure: false,
  }
})
app.use(sessionsMiddleware)

/* ST database stuffz - mongoose connection */
mongoose.connect('mongodb://localhost:27017/TriggerAware', {useMongoClient:true}, function(mongooseErr) {
  if(mongooseErr) {console.log(mongooseErr)}
  else {console.log('mongoose ACTIVAAAATE!')}
})
mongoose.Promise = global.Promise

/* user data */
// var UserSchema = new mongoose.Schema({
//   username: {
//     type:     String,
//     required: true,
//     unique:   true,
//   },
//   password: {
//     type:     String,
//     required: true,
//   },
//   created: {
//     type:     Date,
//     default:  function(){return new Date()}
//   },
// })
// var User = mongoose.model('User', UserSchema)

/* recommend a db entry */
var RecSchema = new mongoose.Schema({
  userEmail: {
    type:     mongoose.SchemaTypes.Email,
    required: true,
  },
  title: {
    type:     String,
    required: true,
    unique:   true,
  },
  triggerType: {
    type:     Array,
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
    required: true,
  },
})
var RecModel = mongoose.model('Rec', RecSchema)

/* DB built by scraping */
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





/* ST express stuffz */

/* authentication stuff */
// var checkIfLoggedIn = function(req,res,next) {
//   if(req.session._id) {
//     console.log('user is logged in. proceeding to the next route handler.')
//     next()
//   } else {
//     res.redirect('/register')
//   }
// }
// app.use(function(req,res,next) {
//   res.sendFile('./public/html/index.html', {root:'./'})
// })






/* routes */
app.get('/', function(req,res) {
  res.sendFile('./public/html/index.html', {root:'./'})
})

app.get('/search', function(req,res) {
  res.sendFile('./public/html/search.html', {root:'./'})
})

app.post('/search', function(req,res) {
  // console.log('req.body --- ', req.body, 'req.body.title --- ', req.body.title)

  var titleString = req.body.title

  var options = {
  shouldSort: true,
  threshold: 0.3,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    "title",
    "triggerType"
  ]
}

  MediaModel.find({}, function(err,docs) {
    if(err) {
      console.log(err)
    } else {
      console.log(docs)
      var fuse = new Fuse(docs, options); // "list" is the item array
      var result = fuse.search(req.body.title);
      //
      console.log('search result --- ', result)
      res.send(result)
    }
  })

})  // z app.post('/search')

app.get('/about', function(req,res) {
  res.sendFile('./public/html/about.html', {root:'./'})
})

app.get('/recommend', function(req,res) {
  res.sendFile('./public/html/recommend.html', {root:'./'})
})

app.post('/recommend', function(req,res) {
  console.log('req body: ', req.body)

  var newTriggerRec = {
    userEmail: req.body.userEmail,
    title: req.body.title,
    triggerType: req.body.triggerType,
    episodeNumber: req.body.episodeNumber,
    episodeName: req.body.episodeName,
    description: req.body.description,
  }

  new RecModel(newTriggerRec).save(function(err, newTriggerRec) {
    if(err) {
      res.status(418).send(err)
      consol.log(err)
    }
    // res.status(200).send(newTriggerRec)
    res.send('wooooo! great success!')
    // console.log('great success!')
  })
})


/* validating recommended entries by moving them from rec to media collection */
// app.get('/validateEntries', function(req,res) {
//   res.sendFile('./public/html/validateEntries.html', {root:'./'})
// })
// app.post('/validateEntries', function(req,res) {
//   console.log('req.body --- ', req.body)
//   // this is where the record will be moved from the reqs collection to the media collection.
// })


/* registering users */
// app.get('/register', function(req,res) {
//   res.sendFile('./public/html/register.html', {root:'./'})
// })
// app.post('/register', function(req,res) {
//   res.sendFile('./public/html/register.html', {root:'./'})
// }


/* logging users in and out */
// app.get('/login', function(req,res) {
//   res.sendFile('./public/html/login.html', {root:'./'})
// })
// app.post('/login', function(req,res) {
//   res.sendFile('./public/html/login.html', {root:'./'})
// })
// app.get('/logout', function(req,res) {
//   req.session.reset()
//   res.redirect('/')
// })



/* -=-=-=-=-=-=-=-=-=-=-=-=-=- */

app.use(function(req,res,next) {
  res.status(404)
  res.send(`that's a 404 error, yo.`)
})

app.listen(8080, function() {
  console.log('running on 8080')
})

// app.listen(80, function() {
//   console.log('running on port 80')
// })
