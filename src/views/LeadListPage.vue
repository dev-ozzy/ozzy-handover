<!-- src/views/LeadsListPage.vue -->
<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-3xl font-bold text-gray-900">Daftar Semua Leads</h1>
          <button
            @click="resetFilters"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Reset Filter
          </button>
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Tanggal Awal Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Awal
            </label>
            <input
              v-model="filters.tanggal_awal"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedFetch"
            />
          </div>

          <!-- Tanggal Akhir Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              v-model="filters.tanggal_akhir"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedFetch"
            />
          </div>

          <!-- Deal Maker Filter -->

          <!-- Branch Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Cabang
            </label>
            <select
              v-model="filters.branch"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="fetchLeads"
            >
              <option value="">Semua Cabang</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Surabaya">Surabaya</option>
              <option value="Semarang">Semarang</option>
              <option value="Yogyakarta">Yogyakarta</option>
            </select>
          </div>

          <!-- Channel Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Channel
            </label>
            <select
              v-model="filters.channel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="fetchLeads"
            >
              <option value="">Semua Channel</option>
              <option value="Facebook">Facebook</option>
              <option value="Website">Website</option>
              <option value="Instagram">Instagram</option>
              <option value="CTWA">CTWA</option>
              <option value="ORGANIK">ORGANIK</option>
              <option value="OUTLET">OUTLET</option>
            </select>
          </div>

          <!-- Official Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Official
            </label>
            <select
              v-model="filters.official"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="fetchLeads"
            >
              <option value="">Semua</option>
              <option value="Ya">Ya</option>
              <option value="Tidak">Tidak</option>
            </select>
          </div>
        </div>

        <div
          class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mt-4"
        >
          <!-- KIRI: Per Page Selection -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">
              Tampilkan per halaman:
            </label>
            <select
              v-model="filters.per_page"
              class="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @change="fetchLeads"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>

          <!-- KANAN: Deal Maker ID -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700"> Search : </label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Deal Maker / Leads"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedFetch"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-8">
        <div class="flex items-center justify-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
          ></div>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  No
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Tanggal
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Waktu
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Deal Maker
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Cabang
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Channel
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Official
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Nomor Leads
                </th>
                <th
                  v-if="userRole === 'Superadmin'"
                  class="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(lead, index) in leadsList"
                :key="lead.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ getRowNumber(index) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ formatDate(lead.tanggal) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ lead.waktu_leads }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ lead.deal_maker?.name || "-" }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ lead.cabang }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-semibold',
                      getChannelClass(lead.channel),
                    ]"
                  >
                    {{ lead.channel }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ lead.nomor_leads }}
                </td>
                <td
                  v-if="userRole === 'Superadmin'"
                  class="px-6 py-4 whitespace-nowrap text-center text-sm"
                >
                  <button
                    @click="openDeleteModal(lead)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    title="Hapus lead"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Hapus
                  </button>
                </td>
              </tr>
              <tr v-if="leadsList.length === 0">
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                  <div class="flex flex-col items-center gap-2">
                    <svg
                      class="w-16 h-16 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p class="text-lg font-medium">Tidak ada data leads</p>
                    <p class="text-sm">Coba ubah filter pencarian Anda</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <Pagination
          v-if="pagination.total > 0"
          :current-page="pagination.current_page"
          :total-pages="pagination.last_page"
          :total-items="pagination.total"
          :per-page="pagination.per_page"
          :from="pagination.from"
          :to="pagination.to"
          @page-change="onPageChange"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      :show="showDeleteModal"
      :lead="selectedLead"
      :is-deleting="isDeleting"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />

    <!-- Toast Notification -->
    <TransitionRoot :show="notification.show" as="template">
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
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

        <TransitionChild
          as="template"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            class="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-md"
          >
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6">
              <div class="text-center">
                <div
                  class="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4"
                  :class="
                    notification.type === 'error'
                      ? 'bg-red-100'
                      : 'bg-green-100'
                  "
                >
                  <svg
                    v-if="notification.type === 'success'"
                    class="h-10 w-10 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <svg
                    v-else
                    class="h-10 w-10 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h3
                  :class="[
                    'text-xl font-bold mb-2',
                    notification.type === 'error'
                      ? 'text-red-900'
                      : 'text-green-900',
                  ]"
                >
                  {{ notification.type === "error" ? "Error!" : "Berhasil!" }}
                </h3>
                <p class="text-sm text-gray-600">{{ notification.message }}</p>
              </div>
            </div>
          </div>
        </TransitionChild>
      </div>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from "vue";
import axios from "axios";
import { TransitionRoot, TransitionChild } from "@headlessui/vue";
import Pagination from "../Component/Pagination.vue";
import DeleteConfirmationModal from "../Component/DeleteConfirmationModal.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

if (!auth.isLoggedIn) {
  auth.redirectToLogin();
}

const userRole = computed(() => auth.role ?? "-");

const API_BASE = import.meta.env.VITE_API_BASE;

// State
const loading = ref(false);
const leadsList = ref([]);
const showDeleteModal = ref(false);
const selectedLead = ref(null);
const isDeleting = ref(false);

const filters = reactive({
  search: "",
  branch: "",
  channel: "",
  official: "",
  per_page: 10,
  page: 1,
});

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 10,
  from: 0,
  to: 0,
});

const notification = reactive({
  show: false,
  type: "success",
  message: "",
});

let debounceTimer = null;

onMounted(() => {
  fetchLeads();
});

const fetchLeads = async () => {
  loading.value = true;

  try {
    const params = {
      page: filters.page,
      per_page: filters.per_page,
    };

    if (filters.search) params.search = filters.search;
    if (filters.branch) params.branch = filters.branch;
    if (filters.channel) params.channel = filters.channel;
    if (filters.official) params.official = filters.official;

    const response = await axios.get(`${API_BASE}/leads`, { params });

    leadsList.value = response.data.data;

    pagination.current_page = response.data.current_page;
    pagination.last_page = response.data.last_page;
    pagination.total = response.data.total;
    pagination.per_page = response.data.per_page;
    pagination.from = response.data.from || 0;
    pagination.to = response.data.to || 0;
  } catch (error) {
    console.error("Error fetching leads:", error);
    leadsList.value = [];
  } finally {
    loading.value = false;
  }
};

const debouncedFetch = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    filters.page = 1;
    fetchLeads();
  }, 500);
};

const resetFilters = () => {
  filters.search = "";
  filters.branch = "";
  filters.channel = "";
  filters.official = "";
  filters.per_page = 10;
  filters.page = 1;
  fetchLeads();
};

const onPageChange = (page) => {
  filters.page = page;
  fetchLeads();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const getRowNumber = (index) => {
  return (pagination.current_page - 1) * pagination.per_page + index + 1;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  if (dateString.includes("/")) return dateString;
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID");
};

const getChannelClass = (channel) => {
  const channelColors = {
    Facebook: "bg-blue-100 text-blue-800",
    Website: "bg-indigo-100 text-indigo-800",
    Instagram: "bg-pink-100 text-pink-800",
    CTWA: "bg-green-100 text-green-800",
    ORGANIK: "bg-emerald-100 text-emerald-800",
    OUTLET: "bg-purple-100 text-purple-800",
  };
  return channelColors[channel] || "bg-gray-100 text-gray-800";
};

const openDeleteModal = (lead) => {
  selectedLead.value = lead;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  selectedLead.value = null;
};

const confirmDelete = async () => {
  if (!selectedLead.value) return;

  isDeleting.value = true;

  try {
    await axios.delete(`${API_BASE}/leads/${selectedLead.value.id}`);

    showNotification("success", "Data leads berhasil dihapus!");
    closeDeleteModal();

    // Refresh data
    await fetchLeads();
  } catch (error) {
    console.error("Error deleting lead:", error);

    let errorMessage = "Gagal menghapus data";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.request) {
      errorMessage = "Tidak dapat terhubung ke server";
    }

    showNotification("error", errorMessage);
  } finally {
    isDeleting.value = false;
  }
};

const showNotification = (type, message) => {
  notification.type = type;
  notification.message = message;
  notification.show = true;

  setTimeout(() => {
    notification.show = false;
  }, 3000);
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
