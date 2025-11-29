<template>
  <header class="bg-white border-b">
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
      aria-label="Global"
    >
      <div class="flex lg:flex-1 items-center gap-2">
        <a href="#" class="-m-1.5 p-1.5 flex items-center gap-2">
          <img class="h-8 w-auto" src="/logo-mail-sec.png" alt="Logo" />
          <span class="font-semibold text-gray-800 hidden sm:inline">
            Ozzy Hand Over
          </span>
        </a>
      </div>

      <div class="flex items-center gap-4">
        <!-- Nama user (kalau login) -->
        <span
          v-if="isLoggedIn && user"
          class="hidden sm:inline text-sm text-gray-600"
        >
          Hi, <span class="font-semibold">{{ user.name }}</span>
        </span>

        <!-- Desktop logout -->
        <div class="hidden lg:flex lg:flex-1 lg:justify-end">
          <Button
            v-if="isLoggedIn"
            label="Logout"
            icon="pi pi-sign-out"
            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            @click="handleLogout"
            >Logout</Button
          >
        </div>

        <!-- Mobile menu button -->
        <button
          type="button"
          class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 lg:hidden"
          @click="mobileMenuOpen = true"
        >
          <span class="sr-only">Open main menu</span>
          <Bars3Icon class="size-6" aria-hidden="true" />
        </button>
      </div>
    </nav>

    <!-- MOBILE MENU -->
    <Dialog
      class="lg:hidden"
      @close="mobileMenuOpen = false"
      :open="mobileMenuOpen"
    >
      <div class="fixed inset-0 z-40 bg-black/30"></div>
      <DialogPanel
        class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
      >
        <div class="flex items-center justify-between">
          <a href="#" class="-m-1.5 p-1.5 flex items-center gap-2">
            <!-- logo-mail-sec.png -->
            <img class="h-8 w-auto" src="/logo-mail-sec.png" alt="Logo" />
            <span class="font-semibold text-gray-800"> Ozzy Hand Over </span>
          </a>
          <button
            type="button"
            class="-m-2.5 rounded-md p-2.5 text-gray-700"
            @click="mobileMenuOpen = false"
          >
            <span class="sr-only">Close menu</span>
            <XMarkIcon class="size-6" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-6">
          <p v-if="isLoggedIn && user" class="mb-4 text-sm text-gray-600">
            Login sebagai <span class="font-semibold">{{ user.name }}</span>
          </p>

          <Button
            v-if="isLoggedIn"
            label="Logout"
            icon="pi pi-sign-out"
            class="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            @click="handleLogout"
            >Logout</Button
          >
        </div>
      </DialogPanel>
    </Dialog>
  </header>
</template>

<script setup>
import {
  ArrowPathIcon,
  Bars3Icon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

// state UI
const mobileMenuOpen = ref(false);

// store & router
const auth = useAuthStore();
const router = useRouter();

// bikin ref reaktif dari store
const { isLoggedIn, user } = storeToRefs(auth);

// function logout yang rapi
const handleLogout = () => {
  auth.logout();
  mobileMenuOpen.value = false;
  router.push({ name: "login" });
};
</script>
