import { createApp } from 'vue'
import axios from 'axios';
import App from './App.vue'

createApp(App).mount('#app')

export default {
    mounted() {
      axios.get('/api')
        .then(response => console.log(response.data))
        .catch(error => console.error('Error:', error));
    },
  };