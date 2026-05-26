import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/user';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPassword.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/verification',
    name: 'Verification',
    component: () => import('@/views/Verification.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/appeal',
    name: 'Appeal',
    component: () => import('@/views/Appeal.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/trips',
    name: 'Trips',
    component: () => import('@/views/Trips.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/trip/:id',
    name: 'TripDetail',
    component: () => import('@/views/TripDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/car-types',
    name: 'CarTypes',
    component: () => import('@/views/CarTypes.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/service',
    name: 'Service',
    component: () => import('@/views/Service.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { requiresAuth: false }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;
