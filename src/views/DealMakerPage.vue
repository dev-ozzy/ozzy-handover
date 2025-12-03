<!-- src/views/DealMakerPage.vue -->
<template>
  <div class="p-6">
    <!-- Role and name disini -->
    <h1 class="text-2xl font-bold mb-4">
      {{ userName }} - {{ userRole }} - {{ userCabang }}
    </h1>

    <div class="mb-4 flex items-center gap-2">
      <button
        v-if="!activeHandover"
        @click="openAlasanModal"
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
          <th class="border px-2 py-1">Waktu Handover</th>
          <th class="border px-2 py-1">Selesai</th>
          <th class="border px-2 py-1">Kecepatan Handover</th>
          <th class="border px-2 py-1">Total Handover</th>
          <th class="border px-2 py-1">CS Back End</th>
          <th class="border px-2 py-1">Cabang</th>
          <th class="border px-2 py-1">Alasan</th>
          <th class="border px-2 py-1">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in handovers" :key="h.id">
          <td class="border px-2 py-1">{{ h.tanggal }}</td>
          <td class="border px-2 py-1">{{ h.waktu_mulai }}</td>
          <td class="border px-2 py-1">{{ h.waktu_handover ?? "-" }}</td>
          <td class="border px-2 py-1">{{ h.waktu_selesai ?? "-" }}</td>
          <td class="border px-2 py-1">{{ h.kecepatan_handover ?? "-" }}</td>
          <td class="border px-2 py-1">{{ h.total_hand_over ?? "-" }}</td>
          <td class="border px-2 py-1">
            {{ h.cs_back_end?.name ?? "-" }}
          </td>
          <td class="border px-2 py-1">{{ h.cabang }}</td>
          <td class="border px-2 py-1">{{ h.alasan ?? "-" }}</td>
          <td class="border px-2 py-1">{{ h.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <TransitionRoot as="template" :show="open">
    <Dialog class="relative z-10" @close="open = false">
      <!-- Overlay -->
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
      </TransitionChild>

      <!-- Wrapper -->
      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <!-- Panel -->
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md"
            >
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-6">
                <DialogTitle
                  as="h3"
                  class="text-lg font-semibold text-gray-900 mb-4 text-center"
                >
                  Alasan Handover
                </DialogTitle>

                <!-- Tombol Pilihan -->
                <div class="flex flex-col space-y-3">
                  <!-- Istirahat -->
                  <button
                    type="button"
                    class="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="startHandover('Istirahat')"
                    :disabled="loadingHandover"
                  >
                    <span
                      v-if="loadingHandover && alasanDipilih === 'Istirahat'"
                    >
                      Mengirim...
                    </span>
                    <span v-else> Istirahat </span>
                  </button>

                  <!-- Konsumen -->
                  <button
                    type="button"
                    class="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    @click="startHandover('Konsumen')"
                    :disabled="loadingHandover"
                  >
                    <span
                      v-if="loadingHandover && alasanDipilih === 'Konsumen'"
                    >
                      Mengirim...
                    </span>
                    <span v-else> Konsumen </span>
                  </button>

                  <!-- Cancel -->
                  <button
                    type="button"
                    class="w-full rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    @click="open = false"
                    :disabled="loadingHandover"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { useAuthStore } from "@/stores/auth";
const open = ref(false);
let intervalId = null;

const API_BASE = import.meta.env.VITE_API_BASE;
const auth = useAuthStore();
const userName = computed(() => auth.user?.name ?? "-");
const userRole = computed(() => auth.role ?? "-");
const userCabang = computed(() => auth.user?.cabang ?? "-");
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

// modal alasan handover
// const showAlasanModal = ref(false);

const openAlasanModal = () => {
  open.value = true;
};

const loadingHandover = ref(false);
const alasanDipilih = ref(null);

const startHandover = async (alasan) => {
  loadingHandover.value = true;
  alasanDipilih.value = alasan;

  try {
    open.value = false; // tutup modal
    const res = await axios.post(`${API_BASE}/handovers/start`, {
      alasan,
    });

    // if (res.data) {
    //   // handovers.value.unshift(res.data);
    // }
  } catch (e) {
    console.error(e);
    // optional: tampilkan toast/error
  } finally {
    loadingHandover.value = false;
    alasanDipilih.value = null;
  }
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
