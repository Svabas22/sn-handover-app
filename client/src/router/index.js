import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/loginComp.vue';
import Home from '@/components/homeComp.vue';
//import formTest from '@/components/formTest';


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: Login },
    { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true }  }
  ]
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Adjust as needed
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});


export default router;