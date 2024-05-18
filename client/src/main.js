import { createApp } from 'vue';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.css';
import App from './App.vue';
import router from './router';

// Create Vue application
const app = createApp(App);
//app.mount('#app');

// Check authentication status before mounting the app
axios.get('/auth/status')
  .then(response => {
    console.log('Authentication status:', response.data.authenticated);
    console.log('User:', response.data.user.name);
    if (response.data.authenticated) {
      localStorage.setItem('userAuthenticated', 'true');  // Set authenticated status
      localStorage.setItem('user', response.data.user.name);  // Set user info
      app.use(router).mount('#app');  // Mount the app if authenticated
    } else {
      localStorage.removeItem('userAuthenticated');  // Clear authentication status
      localStorage.removeItem('user');
      console.log(localStorage.getItem('user'));
      router.push('/login');  // Redirect to login
      app.use(router).mount('#app');  // Mount the app
    }
  })
  .catch(error => {
    console.error('Error checking authentication status:', error);
    localStorage.removeItem('userAuthenticated');  // Ensure clean state on error
    localStorage.removeItem('user');
    router.push('/login');  // Redirect to login on error
    app.use(router).mount('#app');  // Mount the app
  });
