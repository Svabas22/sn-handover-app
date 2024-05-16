import { createApp } from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';

// Create Vue application
const app = createApp(App);
//app.mount('#app');

// Check authentication status before mounting the app
axios.get('/auth/status')
  .then(response => {
    console.log('Authentication status:', response.data.authenticated);
    if (response.data.authenticated) {
      localStorage.setItem('userAuthenticated', 'true');  // Set authenticated status
      app.use(router).mount('#app');  // Mount the app if authenticated
    } else {
      localStorage.removeItem('userAuthenticated');  // Clear authentication status
      router.push('/login');  // Redirect to login
      app.use(router).mount('#app');  // Mount the app
    }
  })
  .catch(error => {
    console.error('Error checking authentication status:', error);
    localStorage.removeItem('userAuthenticated');  // Ensure clean state on error
    router.push('/login');  // Redirect to login on error
    app.use(router).mount('#app');  // Mount the app
  });
