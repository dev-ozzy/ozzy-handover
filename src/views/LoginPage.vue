<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>

      <form @submit.prevent="submit">
        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
        >
          Login
        </button>

        <p v-if="error" class="mt-3 text-red-600 text-sm">
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const error = ref("");
const auth = useAuthStore();
const router = useRouter();

const submit = async () => {
  error.value = "";
  try {
    await auth.login({ email: email.value, password: password.value });

    // redirect sesuai role
    if (auth.role === "Deal Maker") {
      router.push({ name: "deal-maker" });
    } else if (auth.role === "CS Back End" || auth.role === "SPV Deal Maker") {
      router.push({ name: "cs-be" });
    } else {
      router.push({ name: "login" });
      // eror value untuk menampilkan pesan error
      error.value = "Anda tidak memiliki role yang sesuai.";
    }
  } catch (err) {
    error.value = "Login gagal, cek email / password.";
    console.error(err);
  }
};
</script>
