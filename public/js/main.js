console.log('js is linked, yo')

Vue.component('main-nav', {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">

      <a class="navbar-brand" href="/" id="brand"> TriggerAware </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="/about"> about us <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/search"> search our database <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/recommend"> recommend a triggering scene </a>
          </li>

        </ul>
      </div>
    </nav>
  `,
})

Vue.component('main-footer', {
  template: `
    <footer> site designed and maintained by <a id="linkID" v-bind:href='url' target="_blank"> bt franzen </a> </footer>
  `,
  props: ['url']
})

Vue.component('search-results', {
  template: `
    <div class="card border-danger mb-3" style="max-width: 100%;">
      <div id="resultsTitle" class="card-header">
      {{title}}
      </div>
      <div class="card-body text-danger" id="triggerBox">
        <p id="resultsTrigger" class="card-text"> {{trigger}} </p>
      </div>
    </div>
  `,
  props: ['title', 'trigger']
})

Vue.component('validate-rec', {
  template: `
  <form>
    <div id="valBtns">
      title: {{title}}<br/>
      triggerType: {{triggerType}}<br/>
      episodeNumber: {{episodeNumber}}<br/>
      episodeName: {{episodeName}}<br/>
      description: {{description}}<br/>

      <button type="button" class="btn btn-outline-success"> add this record to the DB </button>
      <button type="button" class="btn btn-outline-danger"> delete this dumpster fire </button>
    </div><br/><br/>
  </form>
  `,
  props: ['id', 'userEmail', 'title', 'triggerType', 'episodeNumber', 'episodeName', 'description']
})




var mainVM = new Vue({
  el: '#app',
  data: {
    loginForm: {
      username: '',
      password: '',
    },

    regForm: {
      username: '',
      password: '',
    },

    recForm: {
      userEmail: '',
      title: '',
      triggerType: '',
      episodeNumber: '',
      episodeName: '',
      description: '',
    },

    searchTitle: '',

    searchResults: [{
      title: '',
      triggerType: '',
    }],

    recEntries: [{
      id: '',
      email: '',
      title: '',
      triggerType: '',
      episodeNumber: '',
      episodeName: '',
      description: '',
    }],

    visible: true,

    recordsFound: [],

  },

  methods: {
    recommend: function() {
      if(!$.trim(this.recForm.userEmail || this.recForm.title || this.recForm.triggerType)) {
        alert('please enter required information')
      } else {
        $.post('/recommend', this.recForm, function(dataFromServer) {
          console.log('this is data from the server --- ', dataFromServer)
        })
      }
      mainVM.recForm = ""
    },

    searchDBtitle: function() {
      if(!$.trim(this.searchTitle)) {
        alert('please enter a movie title or a trigger type')
      } else {
       $.post('/searchTitle',{title: this.searchTitle}, function(dataFromServer) {
         console.log('this is data from the server --- ', dataFromServer)
          if(dataFromServer.length === 0) {
            mainVM.searchResults.push({
              title: 'No results found',
              triggerType: 'This title may be safe'
          })
        } else {
          for(let item in dataFromServer) {
            mainVM.recordsFound = dataFromServer.length
            mainVM.searchResults.push({
              title: dataFromServer[item].title,
              triggerType: dataFromServer[item].triggerType.join(', ')
            })
          }
        }
        })
      }
      mainVM.searchTitle = ""
    },

    getRecEntries: function() {
      $.get('/validateEntries', function(dataFromServer) {
        console.log(dataFromServer)
        mainVM.recEntries = dataFromServer
      })
    },

    validateEntries: function() {
      console.log('mainVM.recEntries --- ', mainVM.recEntries[0].title)
      // var recEntries = mainVM.recEntries
      //
      // $.post('/validateEntries', {recEntries}, function(dataFromServer) {
      //   console.log('rec entries from db --- ', dataFromServer)
      // })
      mainVM.recEntries[0].title = ""
      mainVM.recEntries[0].triggerType=""
      mainVM.recEntries[0].episodeNumber=""
      mainVM.recEntries[0].episodeName=""
      mainVM.recEntries[0].description=""
      // mainVM.getRecEntries()
    },

    removeRec: function(item) {
      console.log(item._id)
      $.post('/removeItem', item, function(dataFromServer) {
        console.log(dataFromServer)
        mainVM.recEntries.push(dataFromServer)
      })
      mainVM.getRecEntries()
    },

    register: function() {
      $.post('/register', this.regForm, function(dataFromServer) {
        console.log(dataFromServer)
      })
    },

    login: function() {
      $.post('/login', this.loginForm, function(dataFromServer) {
        console.log(dataFromServer)
      })
    },

  },
})  // z mainVM
