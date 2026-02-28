import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/sessions",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../components/LoginForm.vue"),
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../components/RegisterForm.vue"),
    meta: { guest: true },
  },
  {
    path: "/sessions",
    name: "Sessions",
    component: () => import("../components/SessionList.vue"),
  },
  {
    path: "/sessions/:id/book",
    name: "SeatSelection",
    component: () => import("../components/SeatGrid.vue"),
    props: true,
  },
  {
    path: "/my-reservations",
    name: "MyReservations",
    component: () => import("../components/MyReservations.vue"),
    meta: { auth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../components/Profile.vue"),
    meta: { auth: true },
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: () => import("../components/AdminDashboard.vue"),
    meta: { auth: true, admin: true },
  },
  {
    path: "/admin/sessions/new",
    name: "CreateSession",
    component: () => import("../components/SessionForm.vue"),
    meta: { auth: true, admin: true },
  },
  {
    path: "/admin/sessions/:id/edit",
    name: "EditSession",
    component: () => import("../components/SessionForm.vue"),
    meta: { auth: true, admin: true },
    props: true,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    redirect: "/sessions",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guards (optional - for future authentication)
router.beforeEach((to, from, next) => {
  // For now, just allow all routes
  // TODO: Add authentication logic here
  next();
});

export default router;
