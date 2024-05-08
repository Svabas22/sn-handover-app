import { createRouter, createWebHistory } from 'vue-router';
//import formTest from '@/components/formTest';
import TestingCards from '@/components/testingCards';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'TestingCards', component: TestingCards }
  ]
});

export default router;
