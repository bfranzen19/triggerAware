console.log('js is linked, yo')

Vue.component('main-nav', {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">

      <a class="navbar-brand" href="/"> TriggerAware </a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" href="/about"> about <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/search"> search <span class="sr-only">(current)</span></a>
          </li>

          <li class="nav-item">
            <a class="nav-link" href="/recommend"> recommend a scene </a>
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

// Vue.component('search-thing', {
//   template: `
//     <form>
//       <div id="searchBox">
//         <input type="text" name="inputBox" size=24>
//         <input type="submit" value="search">
//       </div>
//     </form>
//   `,
// })


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

    searchQuery:'' ,
    searchResults: '',
  },

  methods: {
    recommend: function() {
      // $.post('/register', this.recForm, function(dataFromServer) {
      $.post('/recommend', this.recForm, function(dataFromServer) {
        console.log('this is data from the server --- ', dataFromServer)
      })
      mainVM.recForm = ""
    },

    searchDB: function() {
      console.log(this.searchQuery)
       $.post('/search',{title: this.searchQuery}, function(dataFromServer) {
        console.log('this is data from the server --- ', dataFromServer)
      })
      mainVM.searchQuery = ''
    },

    // login: function() {
    //   $.post('/login', this.loginForm, function(dataFromServer) {
    //     console.log(dataFromServer)
    //   })
    // },

  },
})  // z mainVM
