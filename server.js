var express = require('express')
var mongoose = require('mongoose')
var emailType = require('mongoose-type-email')
var bodyParser = require('body-parser')

/* deployment */
var HTTP = require('http')
var HTTPS = require('https')
var fs = require('fs')


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
  requestKey: 'session',
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
var UserSchema = new mongoose.Schema({
  username: {
    type:     String,
    required: true,
    unique:   true,
  },
  password: {
    type:     String,
    required: true,
  },
  created: {
    type:     Date,
    default:  function(){return new Date()}
  },
})
var User = mongoose.model('User', UserSchema)

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

// separate DB for testing
var MediaModel1 =
mongoose.model('Media1', MediaSchema)

/* ST express stuffz */

/* authentication stuff */
var checkIfLoggedIn = function(req,res,next) {
  if(req.session._id) {
    console.log('user is logged in. proceeding to the next route handler.')
    next()
  } else {
    res.redirect('/')
  }
}

/* authentication middleware */
app.use(function(req,res,next) {
  console.log('session?', req.session)
  // res.sendFile('./public/html/index.html', {root:'./'})
  next()
})


/* routes */
app.get('/', function(req,res) {
  res.sendFile('./public/html/index.html', {root:'./'})
})

app.get('/search', function(req,res) {
  res.sendFile('./public/html/search.html', {root:'./'})
})

app.post('/searchTitle', function(req,res) {

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
    ]
  }

  MediaModel.find({}, function(err,docs) {
    if(err) {
      console.log(err)
    } else {
      console.log(docs)
      var fuse = new Fuse(docs, options); // "list" is the item array
      var result = fuse.search(req.body.title);

      console.log('title search result --- ', result)

      res.send(result)
    }
  })

})  // z app.post('/searchTitle')


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
      console.log(err)
    }
    // res.status(200).send(newTriggerRec)
    res.send('wooooo! great success!')
    // console.log('great success!')
  })
})

app.get('/recEntries', checkIfLoggedIn, function(req,res) {
  res.sendFile('./public/html/validateEntries.html', {root:'./'})
})

app.get('/validateEntries', function(req,res) {
  console.log('req.body --- ', req.body)
  RecModel.find({}, function(err,docs) {
    if(err) {
      console.log(err)
    } else {
      console.log(docs)
      res.send(docs)
    }
  })
})

app.post('/validateEntries', function(req,res) {
  console.log('*** req.body --- ', req.body.recEntries[0])

  var newTrigger = {
    title: req.body.recEntries[0].title,
    triggerType: req.body.recEntries[0].triggerType,
    episodeNumber: req.body.recEntries[0].episodeNumber,
    episodeName: req.body.recEntries[0].episodeName,
    description: req.body.recEntries[0].description,
  }

  new MediaModel1(newTrigger).save(function(err, newTrigger) {
    if(err) {
      res.status(418).send(err)
      console.log(err)
    }
    res.status(200).send(newTrigger)
  })
})

app.post('/removeItem', function(req,res) {
  RecModel.findByIdAndRemove(req.body._id, function(err,rmItem) {
    if(err) {
      console.log(err)
      res.send(err)
    } else {
      console.log('deleted --- ', rmItem)
      res.send(rmItem)
    }
  })
})



/* logging users in and out */

app.post('/register', function(req,res) {
  var newUser = new User(req.body)
  bcrypt.genSalt(11, function(saltErr,salt) {
    if(saltErr) {console.log(saltErr)}

    bcrypt.hash(newUser.password, salt, function(hashErr, hashedPassword) {
      if(hashErr) {console.log(hashErr)}
      newUser.password = hashedPassword
      newUser.save(function(err) {
        if(err) {
          console.log('failed to save user')
          res.send(err)
        } else {
          req.session._id = newUser._id
          res.send({success:'success!'})
        }
      })
    })
  })
})

app.get('/login', function(req,res) {
  res.sendFile('./public/html/login.html', {root:'./'})
})

app.post('/login', function(req,res) {
  console.log(req.body)
  var uname = req.body.username
  var pass = req.body.password

  User.findOne({username:uname}, function(err,user) {
  if(err) {
    console.log('failed to find user')
    res.send({failure:'failure'})
  } else if(!user) {
    res.send({failure: 'failure'})
  } else {
    bcrypt.compare(pass, user.password, function(bcryptErr,matched) {
      if(bcryptErr) {
        console.log('bcrypt err --- ', bcryptErr)
        res.send({failure: 'failure'})
      } else if(!matched) {
        console.log(`wrong username/password`)
        res.send({failure:'failure'})
      } else if(matched) {
        req.session._id = user._id
        res.send({success:'success'})
      }
    })
  }
})
})

app.get('/logout', function(req,res) {
  req.session.reset()
  res.redirect('/login')
})


/* -=-=-=-=-=-=-=-=-=-=-=-=-=- */

app.use(function(req,res,next) {
  res.status(404)
  res.send(`that's a 404 error, yo.`)
})

try {
  var httpsConfig = {
    key: fs.readFileSync('/etc/letsencrypt/live/triggeraware.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/triggeraware.com/cert.pem'),
  }

  var httpsServer = HTTPS.createServer(httpsConfig, app)
  httpsServer.listen(443)

  var httpApp = express()
  httpApp.use(function(req,res,next) {
    res.redirect('https://triggeraware.com' + req.url)
  })
  httpApp.listen(80)
}
catch(e) {
  console.log(e)
  console.log('could not start HTTPS server')
  var httpServer = HTTP.createServer(app)
  httpServer.listen(80)
}

// app.listen(8080, function() {
//   console.log('running on 8080')
// })
