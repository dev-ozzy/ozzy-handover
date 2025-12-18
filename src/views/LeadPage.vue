<!-- src/views/LeadPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-sm text-gray-600 mb-2">
          {{ userName }}<br />
          {{ userRole }} - {{ userCabang }}
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-6">LEADS MASUK</h1>
      </div>

      <!-- Channel Online Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">CHANNEL ONLINE</h2>
        <div class="grid grid-cols-5 gap-3">
          <button
            v-for="channel in channelsOnline"
            :key="channel"
            @click="openOnlineModal(channel)"
            :class="[
              'py-3 px-4 border-2 rounded font-medium transition-all',
              formData.channelOnline === channel
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400',
            ]"
          >
            {{ channel }}
          </button>
        </div>
      </div>

      <!-- Channel Offline Section -->
      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">CHANNEL OFFLINE</h2>
        <div class="flex justify-center">
          <button
            @click="openOfflineModal"
            :class="[
              'py-3 px-12 border-2 rounded font-medium transition-all',
              formData.channelOffline === 'OUTLET'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400',
            ]"
          >
            OUTLET
          </button>
        </div>
      </div>

      <!-- Table Leads -->
      <div class="mt-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Data Leads</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b"
                >
                  Tanggal
                </th>
                <!-- Waktu -->
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b"
                >
                  Waktu
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b"
                >
                  Leads Deal Maker
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b"
                >
                  Cabang
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b"
                >
                  Channel
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b"
                >
                  Official
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b"
                >
                  Nomor Leads
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(lead, index) in leadsList"
                :key="index"
                class="hover:bg-gray-50 border-b"
              >
                <td class="px-4 py-3 text-sm text-gray-700">
                  {{ lead.tanggal }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                  {{ lead.waktu_leads }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                  {{ lead.dealMaker }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                  {{ lead.cabang }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                  {{ lead.channel }}
                </td>
                <td class="px-4 py-3 text-sm">
                  <span
                    v-if="lead.official"
                    :class="[
                      'px-2 py-1 rounded text-xs font-semibold',
                      lead.official === 'Ya'
                        ? 'bg-green-100 text-green-800'
                        : lead.official === 'Tidak'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800',
                    ]"
                  >
                    {{ lead.official }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                  {{ lead.nomor_leads }}
                </td>
              </tr>
              <tr v-if="leadsList.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                  Belum ada data leads
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal untuk Channel Online -->
    <TransitionRoot as="template" :show="showOnlineModal">
      <Dialog as="div" class="relative z-10" @close="closeOnlineModal">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
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
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
              >
                <div>
                  <DialogTitle
                    as="h3"
                    class="text-lg font-semibold leading-6 text-gray-900 text-center mb-4"
                  >
                    Channel Online: {{ selectedChannel }}
                  </DialogTitle>

                  <div class="mt-4 space-y-4">
                    <!-- Official Selection -->
                    <div>
                      <p
                        class="text-center text-sm font-medium text-gray-700 mb-3"
                      >
                        Apakah dari channel official?
                      </p>
                      <div class="flex justify-center gap-4">
                        <button
                          @click="modalData.isOnlineOfficial = 'Ya'"
                          :class="[
                            'py-2 px-8 border-2 rounded font-medium transition-all',
                            modalData.isOnlineOfficial === 'Ya'
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-green-400',
                          ]"
                        >
                          Ya
                        </button>
                        <button
                          @click="modalData.isOnlineOfficial = 'Tidak'"
                          :class="[
                            'py-2 px-8 border-2 rounded font-medium transition-all',
                            modalData.isOnlineOfficial === 'Tidak'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-red-400',
                          ]"
                        >
                          Tidak
                        </button>
                      </div>
                      <!-- error message -->
                      <div
                        v-if="errors.isOnlineOfficial"
                        class="text-red-500 text-xs mt-2 text-center"
                      >
                        {{ errors.isOnlineOfficial }}
                      </div>
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-center text-gray-700 mb-2"
                      >
                        No Leads
                      </label>
                      <input
                        type="tel"
                        v-model="modalData.nomor_leads"
                        class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="08xxxxxxxxxx"
                      />
                      <!-- error message -->
                      <div
                        v-if="errors.nomor_leads"
                        class="text-red-500 text-xs mt-1"
                      >
                        {{ errors.nomor_leads }}
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 flex gap-3 justify-end">
                    <button
                      @click="closeOnlineModal"
                      class="inline-flex justify-center rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      @click="saveOnlineModal"
                      class="inline-flex justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Modal untuk Channel Offline -->
    <TransitionRoot as="template" :show="showOfflineModal">
      <Dialog as="div" class="relative z-10" @close="closeOfflineModal">
        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
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
                class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
              >
                <div>
                  <DialogTitle
                    as="h3"
                    class="text-lg font-semibold leading-6 text-gray-900 text-center mb-4"
                  >
                    Channel Offline: OUTLET
                  </DialogTitle>

                  <div class="mt-4 space-y-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-center text-gray-700 mb-2"
                      >
                        No Leads
                      </label>
                      <input
                        type="tel"
                        v-model="modalData.nomor_leads"
                        class="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="08xxxxxxxxxx"
                      />
                      <!-- error -->
                      <div
                        v-if="errors.nomor_leads"
                        class="text-red-500 text-xs mt-1"
                      >
                        {{ errors.nomor_leads }}
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 flex gap-3 justify-end">
                    <button
                      @click="closeOfflineModal"
                      class="inline-flex justify-center rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      @click="saveOfflineModal"
                      class="inline-flex justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import axios from "axios";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { useAuthStore } from "@/stores/auth";

const API_BASE = import.meta.env.VITE_API_BASE;
const auth = useAuthStore();
const userName = computed(() => auth.user?.name ?? "-");
const userRole = computed(() => auth.role ?? "-");
const userCabang = computed(() => auth.user?.cabang ?? "-");

// Channels
const channelsOnline = ["Facebook", "Website", "Instagram", "CTWA", "ORGANIK"];

// Form Data
const formData = reactive({
  nomor_leads: "",
  channelOnline: "",
  channelOffline: "",
  isOnlineOfficial: "",
});

// Modal State
const showOnlineModal = ref(false);
const showOfflineModal = ref(false);
const selectedChannel = ref("");

// Modal Data
const modalData = reactive({
  nomor_leads: "",
  isOnlineOfficial: "",
});

// Error State
const errors = reactive({
  nomor_leads: "",
  isOnlineOfficial: "",
});

// Leads List
const leadsList = ref([]);

// Mounted
onMounted(() => {
  fetchLeads();
});

// Fetch Leads
const fetchLeads = async () => {
  try {
    const response = await axios.get(`${API_BASE}/leads`);
    leadsList.value = response.data;
  } catch (error) {
    console.error(error);
  }
};

// Clear Errors
const clearErrors = () => {
  errors.nomor_leads = "";
  errors.isOnlineOfficial = "";
};

// Validate Form
const validateOnlineForm = () => {
  clearErrors();
  let isValid = true;

  if (!modalData.nomor_leads) {
    errors.nomor_leads = "No Leads harus diisi!";
    isValid = false;
  } else if (!/^08\d{8,12}$/.test(modalData.nomor_leads)) {
    errors.nomor_leads = "Format No Leads tidak valid (contoh: 08123456789)";
    isValid = false;
  }

  if (!modalData.isOnlineOfficial) {
    errors.isOnlineOfficial = "Pilih Official (Ya/Tidak)!";
    isValid = false;
  }

  return isValid;
};

const validateOfflineForm = () => {
  clearErrors();
  let isValid = true;

  if (!modalData.nomor_leads) {
    errors.nomor_leads = "No Leads harus diisi!";
    isValid = false;
  } else if (!/^08\d{8,12}$/.test(modalData.nomor_leads)) {
    errors.nomor_leads = "Format No Leads tidak valid (contoh: 08123456789)";
    isValid = false;
  }

  return isValid;
};

// Methods
const openOnlineModal = (channel) => {
  selectedChannel.value = channel;
  // Reset modal data
  modalData.nomor_leads = "";
  modalData.isOnlineOfficial = "";
  clearErrors();
  showOnlineModal.value = true;
};

const closeOnlineModal = () => {
  showOnlineModal.value = false;
  clearErrors();
};

const saveOnlineModal = () => {
  // Validation
  if (!validateOnlineForm()) {
    return;
  }

  // Save to form data
  formData.channelOnline = selectedChannel.value;
  formData.channelOffline = "";
  formData.nomor_leads = modalData.nomor_leads;
  formData.isOnlineOfficial = modalData.isOnlineOfficial;

  // Save to API
  saveToAPI();

  closeOnlineModal();
};

const openOfflineModal = () => {
  // Reset modal data
  modalData.nomor_leads = "";
  modalData.isOnlineOfficial = "";
  clearErrors();
  showOfflineModal.value = true;
};

const closeOfflineModal = () => {
  showOfflineModal.value = false;
  clearErrors();
};

const saveOfflineModal = () => {
  // Validation
  if (!validateOfflineForm()) {
    return;
  }

  // Save to form data
  formData.channelOffline = "OUTLET";
  formData.channelOnline = "";
  formData.nomor_leads = modalData.nomor_leads;
  formData.isOnlineOfficial = "";

  // Save to API
  saveToAPI();

  closeOfflineModal();
};

const saveToAPI = async () => {
  const now = new Date();

  // 🔹 Optimistic data (sesuai struktur tabel)
  const tempLead = {
    id: `temp-${Date.now()}`,
    tanggal: now.toISOString().slice(0, 10),
    waktu_leads: now.toTimeString().slice(0, 8),
    dealMaker: userName.value,
    cabang: userCabang.value,
    channel: formData.channelOnline || formData.channelOffline,
    official: formData.isOnlineOfficial || "-",
    nomor_leads: formData.nomor_leads,
    _optimistic: true,
  };

  // 🔹 Langsung tampil
  leadsList.value.unshift(tempLead);

  // 🔹 Reset form
  formData.nomor_leads = "";
  formData.channelOnline = "";
  formData.channelOffline = "";
  formData.isOnlineOfficial = "";

  try {
    const response = await axios.post(`${API_BASE}/leads`, {
      waktu_leads: tempLead.waktu_leads,
      channel: tempLead.channel,
      official: tempLead.official,
      nomor_leads: tempLead.nomor_leads,
    });

    if (response.data.success) {
      const real = response.data.data;

      const index = leadsList.value.findIndex((l) => l.id === tempLead.id);

      if (index !== -1) {
        leadsList.value[index] = {
          id: real.id,
          tanggal: real.tanggal,
          waktu_leads: real.waktu_leads,
          dealMaker: real.deal_maker?.name ?? "-",
          cabang: real.cabang,
          channel: real.channel,
          official: real.official,
          nomor_leads: real.nomor_leads,
          _optimistic: false,
        };
      }
    }
  } catch (error) {
    console.error(error);

    // 🔥 rollback
    leadsList.value = leadsList.value.filter((l) => l.id !== tempLead.id);

    alert("Gagal menyimpan data");
  }
};
</script>
