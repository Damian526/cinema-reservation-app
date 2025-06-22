import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "../components/LoginForm.vue";
import RegisterForm from "../components/RegisterForm.vue";
import SessionList from "../components/SessionList.vue";
import SeatGrid from "../components/SeatGrid.vue";
import MyReservations from "../components/MyReservations.vue";
import AdminDashboard from "../components/AdminDashboard.vue";
import SessionForm from "../components/SessionForm.vue";

const routes = [
  {
    path: "/",
    redirect: "/sessions",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginForm,
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterForm,
    meta: { guest: true },
  },
  {
    path: "/sessions",
    name: "Sessions",
    component: SessionList,
  },
  {
    path: "/sessions/:id/book",
    name: "SeatSelection",
    component: SeatGrid,
    props: true,
  },
  {
    path: "/my-reservations",
    name: "MyReservations",
    component: MyReservations,
    meta: { auth: true },
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { auth: true, admin: true },
  },
  {
    path: "/admin/sessions/new",
    name: "CreateSession",
    component: SessionForm,
    meta: { auth: true, admin: true },
  },
  {
    path: "/admin/sessions/:id/edit",
    name: "EditSession",
    component: SessionForm,
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
