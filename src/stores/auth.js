import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router";

const API_BASE = import.meta.env.VITE_API_BASE;

function loadUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");

    // kalau belum pernah diset
    if (!raw || raw === "undefined" || raw === "null") {
      return null;
    }

    return JSON.parse(raw);
  } catch (e) {
    console.warn("Gagal parse user dari localStorage, di-reset:", e);
    localStorage.removeItem("user");
    return null;
  }
}

function loadTokenFromStorage() {
  const raw = localStorage.getItem("token");
  if (!raw || raw === "undefined" || raw === "null") {
    return null;
  }
  return raw;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: loadUserFromStorage(),
    token: loadTokenFromStorage(),
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => {
      const user = state.user;
      if (!user) return null;

      if (user.role) return user.role;

      if (Array.isArray(user.roles) && user.roles.length > 0) {
        const first = user.roles[0];
        return typeof first === "string" ? first : first.name;
      }

      if (Array.isArray(user.role_names) && user.role_names.length > 0) {
        return user.role_names[0];
      }

      return null;
    },
  },

  actions: {
    setAuthHeader() {
      if (this.token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }
    },

    initFromStorage() {
      if (this.token) {
        this.setAuthHeader();
      }
    },

    async login(credentials) {
      const res = await axios.post(`${API_BASE}/login`, credentials);

      this.token = res.data.token;
      this.user = res.data.user;

      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));

      this.setAuthHeader();
    },

    async fetchUser() {
      if (!this.token) return;

      try {
        this.setAuthHeader();
        const res = await axios.get(`${API_BASE}/me`);
        // console.log(res.user);

        this.user = res.data.user;
        localStorage.setItem("user", JSON.stringify(this.user));
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.logout();
        } else {
          console.warn("fetchUser gagal tapi tidak logout:", error);
        }
      }
    },

    logout() {
      this.user = null;
      this.token = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      this.setAuthHeader();
      router.push({ name: "login" });
    },
  },
});
