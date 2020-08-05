import Vue from 'vue'
import App from './App.vue'

// Font Awesome
import {
  library
} from '@fortawesome/fontawesome-svg-core'
import {
  faHome,
  faBoxes,
  faDraftingCompass,
  faUserFriends,
  faHandshake
} from '@fortawesome/free-solid-svg-icons'
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome'
import {
  faFontAwesome,
  faGithub,
  faTwitter
} from '@fortawesome/free-brands-svg-icons'
library.add(faHome,
  faFontAwesome,
  faGithub,
  faTwitter,
  faBoxes,
  faDraftingCompass,
  faUserFriends,
  faHandshake
)

// Markdown
import 'github-markdown-css/github-markdown.css'
import hljs from 'highlight.js'

Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.directive('highlight', function (el) {
  const blocks = el.querySelectorAll('pre code')
  blocks.forEach(block => {
    hljs.highlightBlock(block)
  })
})
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')