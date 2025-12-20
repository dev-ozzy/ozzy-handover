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
        <!-- Remember me -->
        <div class="mb-4 flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            v-model="rememberMe"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-900"
            >Ingat saya</label
          >
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
const rememberMe = ref(false);
const error = ref("");
const auth = useAuthStore();
const router = useRouter();

const submit = async () => {
  error.value = "";
  try {
    await auth.login({
      email: email.value,
      password: password.value,
      remember: rememberMe.value,
    });

    // redirect sesuai role
    if (auth.role === "Deal Maker") {
      router.push({ name: "deal-maker" });
    } else if (auth.role === "CS Back End" || auth.role === "SPV Deal Maker") {
      router.push({ name: "cs-be" });
    } else if (auth.role === "Superadmin") {
      router.push({ name: "lead-list" });
    } else {
      router.push({ name: "login" });
      // eror value untuk menampilkan pesan error
      error.value = "Anda tidak memiliki role yang sesuai.";
      // hapus token
      auth.logout();
    }
  } catch (err) {
    error.value = "Login gagal, cek email / password.";
    console.error(err);
  }
};
</script>
