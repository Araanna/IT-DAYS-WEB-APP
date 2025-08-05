import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import QrView from '../views/QrView.vue';
import AttendanceLog from '../views/AttendanceLog.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresGuest: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: '/qr/:id',
      name: 'qr-view',
      component: QrView,
      meta: { requiresAuth: true },
    },
    {
      path: '/attendance/log',
      name: 'attendance-log',
      component: AttendanceLog,
      meta: { requiresAuth: true, requiresSBO: true },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize auth state if token exists
  if (localStorage.getItem('token') && !authStore.state.isAuthenticated) {
    await authStore.fetchUser();
  }

  if (to.meta.requiresAuth && !authStore.state.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authStore.state.isAuthenticated) {
    next('/dashboard');
  } else if (to.meta.requiresSBO && authStore.state.user?.role !== 'SBO') {
    // Redirect SBO-only routes to dashboard if user is not SBO
    next('/dashboard');
  } else {
    next();
  }
});

export default router;