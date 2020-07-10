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
  faUserFriends
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
  faUserFriends
)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')