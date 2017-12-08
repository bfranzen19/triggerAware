console.log('js is linked, yo')

// scrolling
import vueScrollto from 'vue-scrollto'
Vue.use(vueScrollto)

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
    <footer> site designed and maintained by bt franzen </footer>
  `,
})

Vue.component('search-results', {
  template: `

    <div class="card border-danger mb-3" style="max-width: 100%;">
      <div id="resultsTitle" class="card-header"> {{title}} </div>
        <div class="card-body text-danger" id="triggerBox">
          <p id="resultsTrigger" class="card-text"> {{trigger}} </p>
        </div>
    </div>

  `,
  props: ['title', 'trigger']
})

var mainVM = new Vue({
  el: '#app',
  data: {
    // registerForm: {
    //   username: '',
    //   password: '',
    // },
    //
    // loginForm: {
    //   username: '',
    //   password: '',
    // },

    recForm: {
      userEmail: '',
      title: '',
      triggerType: '',
      episodeNumber: '',
      episodeName: '',
      description: '',
    },

    searchTitle: '',
    searchQuery: [],
    searchResults: [{
      title: '',
      triggerType: '',
    }],

    visible: true,

  },

  methods: {
    recommend: function() {
      console.log(this.recForm.length)
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

          for(let item in dataFromServer) {
            mainVM.searchResults.push({
              title: dataFromServer[item].title,
              triggerType: dataFromServer[item].triggerType.join(', ')
            })
          }

        })
      }
      mainVM.searchTitle = ""
    },

  // this doesn't work (yet)
    searchDBtrigger: function() {
      if(!$.trim(this.searchQuery)) {
        alert('please enter a movie title or a trigger type')
      } else {
      triggerQuery = this.searchQuery.join(', ')
      console.log(triggerQuery)

       $.post('/searchTrigger',{triggerType: triggerQuery}, function(dataFromServer) {
        console.log('this is data from the server --- ', dataFromServer)

          for(let item in dataFromServer) {
            mainVM.searchResults.push({
              title: dataFromServer[item].title,
              triggerType: dataFromServer[item].triggerType.join(', ')
            })
          }
        })
      }

      mainVM.searchQuery = ""
    },


    // login: function() {
    //   $.post('/login', this.loginForm, function(dataFromServer) {
    //     console.log(dataFromServer)
    //   })
    // },

  },
})  // z mainVM
