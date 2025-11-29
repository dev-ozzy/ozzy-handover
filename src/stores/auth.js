import { defineStore } from "pinia";
import axios from "axios";
import router from "@/router";

const API_BASE = "http://ozzy-wh.test/api"; // GANTI sesuai URL Laravel kamu

export const useAuthStore = defineStore("auth", {
  /*************  ✨ Windsurf Command ⭐  *************/
  /*******  d2965b27-c6f5-40dd-979a-ef2f221a4c6f  *******/
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    role: (state) => state.user?.role || null,
  },

  actions: {
    async login(credentials) {
      const res = await axios.post(`${API_BASE}/login`, credentials);

      this.token = res.data.token;
      this.user = res.data.user;

      localStorage.setItem("token", this.token);
      localStorage.setItem("user", JSON.stringify(this.user));

      axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
    },

    async fetchUser() {
      if (!this.token) return;

      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`;
        const res = await axios.get(`${API_BASE}/me`);
        this.user = res.data;

        localStorage.setItem("user", JSON.stringify(this.user));
      } catch (error) {
        // cuma logout kalau bener-bener 401 (token invalid / expired)
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

      delete axios.defaults.headers.common["Authorization"];
      router.push({ name: "login" });
    },
  },
});
