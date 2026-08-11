import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '../services/authService';

const routes = [
  {
    path: '/',
    redirect: () => {
      return authService.isAuthenticated() ? '/admin' : '/login';
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../pages/AdminDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authenticated = authService.isAuthenticated();

  if (to.meta.requiresAuth && !authenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authenticated) {
    next('/admin');
  } else {
    next();
  }
});

export default router;
