<!-- src/views/CsBackEndPage.vue -->
<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">{{ userName }} - {{ userRole }}</h1>

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
          <td class="border px-2 py-1">
            {{ h.cs_back_end?.name ?? "-" }}
          </td>
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
            <span v-else class="text-xs text-gray-400"> Selesai </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
let intervalId = null;
import { useAuthStore } from "@/stores/auth";
const auth = useAuthStore();

const userName = computed(() => auth.user?.name ?? "-");
const userRole = computed(() => auth.role ?? "-");
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

const handovers = ref([]);

const loadHandovers = async () => {
  const res = await axios.get(`${API_BASE}/handovers/cs`);
  handovers.value = res.data;
};

const claim = async (id) => {
  const res = await axios.post(`${API_BASE}/handovers/claim/${id}`);
  const idx = handovers.value.findIndex((h) => h.id === id);
  if (idx !== -1) handovers.value[idx] = res.data;
};

onMounted(() => {
  loadHandovers();

  intervalId = setInterval(loadHandovers, 2000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>
