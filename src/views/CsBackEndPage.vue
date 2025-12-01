<!-- src/views/CsBackEndPage.vue -->
<template>
  <div class="p-6">
    <!-- Judul + icon notif -->
    <div class="flex items-center gap-4 mb-4">
      <h1 class="text-2xl font-bold">{{ userName }} - {{ userRole }}</h1>

      <!-- Icon + badge -->
      <div class="relative">
        <button
          class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center text-lg"
        >
          💬
        </button>

        <!-- Badge -->
        <span
          v-if="waitingCount > 0"
          class="absolute -top-1 -right-1 bg-sky-400 text-black font-bold text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center"
        >
          {{ waitingCount }}
        </span>
      </div>
    </div>

    <!-- TABLE -->
    <table class="w-full text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-2 py-1">Tanggal</th>
          <th class="border px-2 py-1">Mulai</th>
          <th class="border px-2 py-1">Deal Maker</th>
          <th class="border px-2 py-1">CS Back End</th>
          <th class="border px-2 py-1">Cabang</th>
          <th class="border px-2 py-1">Aksi</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="h in handovers" :key="h.id">
          <td class="border px-2 py-1">{{ h.tanggal }}</td>
          <td class="border px-2 py-1">{{ h.waktu_mulai }}</td>
          <td class="border px-2 py-1">{{ h.deal_maker?.name }}</td>
          <td class="border px-2 py-1">{{ h.cs_back_end?.name ?? "-" }}</td>
          <td class="border px-2 py-1">{{ h.cabang }}</td>

          <td class="border px-2 py-1 text-center">
            <button
              v-if="h.status === 'waiting_cs'"
              @click="claim(h.id)"
              class="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white"
              title="Ambil hand over ini"
            >
              ✔
            </button>

            <span
              v-else-if="h.status === 'in_progress'"
              class="text-xs px-2 py-1 rounded bg-yellow-200 text-yellow-800"
            >
              In Progress
            </span>

            <span v-else class="text-xs text-gray-400">Selesai</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const API_BASE = import.meta.env.VITE_API_BASE;
const auth = useAuthStore();

const userName = computed(() => auth.user?.name ?? "-");
const userRole = computed(() => auth.role ?? "-");

let intervalId = null;

const handovers = ref([]);

// -----------------------------
// LOAD DATA
// -----------------------------
const loadHandovers = async () => {
  const res = await axios.get(`${API_BASE}/handovers/cs`);
  handovers.value = res.data;
};

// claim
const claim = async (id) => {
  const res = await axios.post(`${API_BASE}/handovers/claim/${id}`);
  const idx = handovers.value.findIndex((h) => h.id === id);
  if (idx !== -1) handovers.value[idx] = res.data;
};

// -----------------------------
// HITUNG NOTIF
// -----------------------------
const waitingCount = computed(
  () => handovers.value.filter((h) => h.status === "waiting_cs").length
);

// -----------------------------
// BADGE PWA + TITLE TAB
// -----------------------------
watch(waitingCount, (val) => {
  // B A D G E  di taskbar Windows (PWA)
  if ("setAppBadge" in navigator && "clearAppBadge" in navigator) {
    if (val > 0) navigator.setAppBadge(val);
    else navigator.clearAppBadge();
  }

  // UPDATE TITLE TAB
  const base = "CS Back End";
  document.title = val > 0 ? `(${val}) ${base}` : base;
});

// -----------------------------
// MOUNT / UNMOUNT
// -----------------------------
onMounted(() => {
  loadHandovers();
  intervalId = setInterval(loadHandovers, 2000);
});

onBeforeUnmount(() => clearInterval(intervalId));
</script>
