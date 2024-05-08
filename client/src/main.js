import { createApp } from 'vue'
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';
import App from './App.vue'
import router from './router'

const app = createApp(App);

app.use(router);
app.mount('#app')

export default {
    mounted() {
      axios.get('/api')
        .then(response => console.log(response.data))
        .catch(error => console.error('Error:', error));
    },
  };
