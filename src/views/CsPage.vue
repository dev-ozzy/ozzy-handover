<!-- src/views/DealMakerPage.vue -->
<template>
  <div class="p-6">
    <!-- Role and name disini -->
    <h1 class="text-2xl font-bold mb-4">{{ userName }} - {{ userRole }}</h1>

    <div class="mb-4 flex items-center gap-2">
      <button
        v-if="!activeHandover"
        @click="startHandover"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Mulai Hand Over
      </button>
      <button
        v-else-if="activeHandover.status === 'waiting_cs'"
        class="bg-red-600 text-white px-4 py-2 rounded"
        disabled
      >
        ({{ activeHandover.cs_back_end?.name ?? "Menunggu CS" }})
      </button>

      <button
        v-else
        @click="finishHandover"
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Selesai ({{ activeHandover.cs_back_end?.name ?? "Menunggu CS" }})
      </button>
    </div>

    <h2 class="font-semibold mb-2">Riwayat Handover</h2>
    <table class="w-full text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th class="border px-2 py-1">Tanggal</th>
          <th class="border px-2 py-1">Mulai</th>
          <th class="border px-2 py-1">Selesai</th>
          <th class="border px-2 py-1">Total</th>
          <th class="border px-2 py-1">CS Back End</th>
          <th class="border px-2 py-1">Cabang</th>
          <th class="border px-2 py-1">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in handovers" :key="h.id">
          <td class="border px-2 py-1">{{ h.tanggal }}</td>
          <td class="border px-2 py-1">{{ h.waktu_mulai }}</td>
          <td class="border px-2 py-1">{{ h.waktu_selesai ?? "-" }}</td>
          <td class="border px-2 py-1">{{ h.total_hand_over ?? "-" }}</td>
          <td class="border px-2 py-1">
            {{ h.cs_back_end?.name ?? "-" }}
          </td>
          <td class="border px-2 py-1">{{ h.cabang }}</td>
          <td class="border px-2 py-1">{{ h.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
let intervalId = null;

const API_BASE = import.meta.env.VITE_API_BASE;
const auth = useAuthStore();
const userName = computed(() => auth.user?.name ?? "-");
const userRole = computed(() => auth.role ?? "-");
const handovers = ref([]);
const totalHandOver = ref(0);

const activeHandover = computed(() =>
  handovers.value.find(
    (h) => h.status === "waiting_cs" || h.status === "in_progress"
  )
);

const loadHandovers = async () => {
  const res = await axios.get(`${API_BASE}/handovers/deal-maker`);
  handovers.value = res.data;
};

const startHandover = async () => {
  const res = await axios.post(`${API_BASE}/handovers/start`);
  handovers.value.unshift(res.data);
};

const finishHandover = async () => {
  if (!activeHandover.value) return;
  const id = activeHandover.value.id;

  const res = await axios.post(`${API_BASE}/handovers/finish/${id}`, {
    total_hand_over: totalHandOver.value,
  });

  // update list
  const idx = handovers.value.findIndex((h) => h.id === id);
  if (idx !== -1) handovers.value[idx] = res.data;
  totalHandOver.value = 0;
};

onMounted(() => {
  loadHandovers();

  intervalId = setInterval(loadHandovers, 2000);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
});
</script>
