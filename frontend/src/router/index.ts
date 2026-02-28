import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/sessions',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginForm.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/RegisterForm.vue'),
    meta: { guest: true },
  },
  {
    path: '/secret-admin',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLogin.vue'),
    meta: { guest: true },
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: () => import('../components/SessionList.vue'),
  },
  {
    path: '/sessions/:id/book',
    name: 'SeatSelection',
    component: () => import('../components/SeatGrid.vue'),
    props: true,
  },
  {
    path: '/my-reservations',
    name: 'MyReservations',
    component: () => import('../components/MyReservations.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../components/Profile.vue'),
    meta: { requiresAuth: true },
  },
  // Admin section — nested under AdminLayout
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../views/admin/AdminDashboard.vue'),
      },
      {
        path: 'movies',
        name: 'AdminMovieList',
        component: () => import('../views/admin/AdminMovieList.vue'),
      },
      {
        path: 'movies/new',
        name: 'AdminMovieCreate',
        component: () => import('../views/admin/AdminMovieForm.vue'),
      },
      {
        path: 'movies/:id/edit',
        name: 'AdminMovieEdit',
        component: () => import('../views/admin/AdminMovieForm.vue'),
        props: true,
      },
      // Legacy session routes (keep for backward compat)
      {
        path: 'sessions/new',
        name: 'CreateSession',
        component: () => import('../components/SessionForm.vue'),
      },
      {
        path: 'sessions/:id/edit',
        name: 'EditSession',
        component: () => import('../components/SessionForm.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/sessions',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  // Lazy-import to avoid circular dep; store is a singleton
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuth;
  const role = authStore.user?.role;

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin);
  const isGuest = to.matched.some((r) => r.meta.guest);

  if (requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  if (requiresAdmin && role !== 'admin') {
    return next('/secret-admin');
  }

  if (isGuest && isAuthenticated) {
    // Admin logged in trying to visit /login or /secret-admin → go to admin
    if (role === 'admin') return next('/admin');
    return next('/sessions');
  }

  next();
});

export default router;
