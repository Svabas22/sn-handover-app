import { createRouter, createWebHistory } from 'vue-router';
import formTest from '@/components/formTest';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'formTest', component: formTest }
  ]
});

export default router;
