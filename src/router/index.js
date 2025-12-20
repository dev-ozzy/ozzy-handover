// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import LoginPage from "@/views/LoginPage.vue";
import DealMakerPage from "@/views/DealMakerPage.vue";
import CsBackEndPage from "@/views/CsBackEndPage.vue";
import LeadPage from "@/views/LeadPage.vue";
import LeadListPage from "@/views/LeadListPage.vue";

const routes = [
  {
    path: "/",
    name: "root",
    redirect: () => {
      const auth = useAuthStore();

      if (auth.isLoggedIn) {
        if (auth.role === "Deal Maker") {
          return { name: "deal-maker" };
        }
        if (auth.role === "CS Back End") {
          return { name: "cs-be" };
        }
        if (auth.role === "SPV Deal Maker") {
          return { name: "cs-be" };
        }
        if (auth.role === "Superadmin") {
          return { name: "cs-be" };
        }
      }

      return { name: "login" };
    },
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { guestOnly: true },
  },
  {
    path: "/deal-maker",
    name: "deal-maker",
    component: DealMakerPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/cs-be",
    name: "cs-be",
    component: CsBackEndPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/lead",
    name: "lead",
    component: LeadPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/lead-list",
    name: "lead-list",
    component: LeadListPage,
    meta: { requiresAuth: true },
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // butuh login tapi belum login
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next({ name: "login" });
  }

  // route khusus guest (login) tapi user sudah login
  if (to.meta.guestOnly && auth.isLoggedIn) {
    if (auth.role === "Deal Maker") {
      return next({ name: "deal-maker" });
    }
    if (auth.role === "CS Back End" || auth.role === "SPV Deal Maker") {
      return next({ name: "cs-be" });
    }
    if (auth.role === "Superadmin") {
      return next({ name: "lead-list" });
    }
  }

  next();
});

export default router;
