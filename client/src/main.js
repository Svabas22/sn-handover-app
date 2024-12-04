// main.js
import { createApp } from 'vue';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import store from './store';
import App from './App.vue';
import router from './router';
import socket from './socket.js';


const app = createApp(App);
app.config.globalProperties.$socket = socket;
app.use(router);
app.use(bootstrap);
app.use(store);

socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from Socket.IO server');
});


axios.get('/auth/status')
  .then(response => {
    console.log('Authentication status:', response.data.authenticated);
    console.log('User:', response.data.user.name);
    if (response.data.authenticated) {
      localStorage.setItem('userAuthenticated', 'true');
      localStorage.setItem('user', response.data.user.name);
      localStorage.setItem('roles', response.data.user.roles);
      app.mount('#app');
    } else {
      localStorage.removeItem('userAuthenticated');
      localStorage.removeItem('user');
      console.log(localStorage.getItem('user'));
      router.push('/login');
      app.mount('#app');
    }
  })
  .catch(error => {
    console.error('Error checking authentication status:', error);
    localStorage.removeItem('userAuthenticated');
    localStorage.removeItem('user');
    router.push('/login'); 
    app.mount('#app'); 
  });
