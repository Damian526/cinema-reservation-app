import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

export const isRouteLoading = ref(false);
let routeLoadingTimeout: ReturnType<typeof setTimeout> | null = null;

const startRouteLoading = () => {
  if (routeLoadingTimeout) clearTimeout(routeLoadingTimeout);

  routeLoadingTimeout = setTimeout(() => {
    isRouteLoading.value = true;
  }, 120);
};

const stopRouteLoading = () => {
  if (routeLoadingTimeout) {
    clearTimeout(routeLoadingTimeout);
    routeLoadingTimeout = null;
  }

  isRouteLoading.value = false;
};

const adminAccessGuard = async () => {
  const authStore = useAuthStore();
  await authStore.initSession();

  if (!authStore.isAuth) {
    return { name: 'AdminLogin' };
  }

  if (authStore.user?.role !== 'admin') {
    return { name: 'Sessions' };
  }

  return true;
};

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/sessions',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/admin/AdminLogin.vue'),
    meta: { guest: true },
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: () => import('../views/SessionsView.vue'),
  },
  {
    path: '/sessions/:id/book',
    name: 'SeatSelection',
    component: () => import('../views/SeatSelectionView.vue'),
    props: (route) => ({
      sessionId: Number(route.params.id),
    }),
  },
  {
    path: '/my-reservations',
    name: 'MyReservations',
    component: () => import('../views/MyReservationsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  // Admin section — nested under AdminLayout
  {
    path: '/admin',
    beforeEnter: adminAccessGuard,
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
      {
        path: 'sessions',
        name: 'AdminSessionList',
        component: () => import('../views/admin/AdminSessionList.vue'),
      },
      {
        path: 'sessions/new',
        name: 'AdminSessionCreate',
        component: () => import('../views/admin/AdminSessionForm.vue'),
      },
      {
        path: 'sessions/:id/edit',
        name: 'AdminSessionEdit',
        component: () => import('../views/admin/AdminSessionForm.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  startRouteLoading();

  const authStore = useAuthStore();

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin);
  const isGuest = to.matched.some((r) => r.meta.guest);
  const needsSessionState = requiresAuth || requiresAdmin || isGuest;

  if (needsSessionState) {
    await authStore.initSession();
  }

  const isAuthenticated = authStore.isAuth;
  const role = authStore.user?.role;

  if (requiresAuth && !isAuthenticated) {
    if (requiresAdmin || to.path.startsWith('/admin')) {
      return { name: 'AdminLogin' };
    }
    return { name: 'Login' };
  }

  if (requiresAdmin && role !== 'admin') {
    return { name: 'Sessions' };
  }

  if (isGuest && isAuthenticated) {
    if (to.name === 'AdminLogin' && role !== 'admin') {
      return { name: 'Sessions' };
    }
    if (role === 'admin') return { name: 'AdminDashboard' };
    return { name: 'Sessions' };
  }

  return true;
});

router.afterEach(() => {
  stopRouteLoading();
});

router.onError(() => {
  stopRouteLoading();
});

export default router;
