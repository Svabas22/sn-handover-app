import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/loginComp.vue';
import Home from '../components/homeComp.vue';


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    { path: '/login', name: 'Login', component: Login },
    { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  ]
});



router.beforeEach((to, from, next) => {
  
  const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true';

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
      next('/');
  } else {
      next();
  }
});

export default router;