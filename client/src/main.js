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
import socket from './socket.js'; // Import the socket instance

// Attach the socket to the Vue prototype so it can be accessed globally
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

// Check authentication status before mounting the app
axios.get('/auth/status')
  .then(response => {
    console.log('Authentication status:', response.data.authenticated);
    console.log('User:', response.data.user.name);
    if (response.data.authenticated) {
      localStorage.setItem('userAuthenticated', 'true');  // Set authenticated status
      localStorage.setItem('user', response.data.user.name);  // Set user info
      localStorage.setItem('roles', response.data.user.roles);
      app.mount('#app');  // Mount the app if authenticated
    } else {
      localStorage.removeItem('userAuthenticated');  // Clear authentication status
      localStorage.removeItem('user');
      console.log(localStorage.getItem('user'));
      router.push('/login');  // Redirect to login
      app.mount('#app');  // Mount the app
    }
  })
  .catch(error => {
    console.error('Error checking authentication status:', error);
    localStorage.removeItem('userAuthenticated');  // Ensure clean state on error
    localStorage.removeItem('user');
    router.push('/login');  // Redirect to login on error
    app.mount('#app');  // Mount the app
  });
