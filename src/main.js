import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import axios from "axios";
import { useAuthStore } from "@/stores/auth";

import "./assets/main.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");

// setelah app terpasang → baru akses store
const auth = useAuthStore();

if (auth.token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
  // cukup panggil, error akan ditangani di dalam fetchUser
  auth.fetchUser();
}
