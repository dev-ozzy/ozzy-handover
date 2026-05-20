<!-- src/views/WaMonitorView.vue -->
<template>
  <div class="p-6">
    <!-- ── Header ── -->
    <h1 class="text-2xl font-bold mb-4">WA Unread Monitor — {{ userName }}</h1>

    <!-- ── Stats ── -->
    <div class="flex gap-4 mb-4 flex-wrap">
      <div class="border rounded px-4 py-2 text-sm">
        <span class="text-gray-500">Total Unread</span>
        <span class="ml-2 font-bold text-gray-800">{{
          conversations.length
        }}</span>
      </div>
      <div class="border rounded px-4 py-2 text-sm">
        <span class="text-gray-500">⚠ Perlu Dibalas</span>
        <span class="ml-2 font-bold text-amber-500">{{ warnCount }}</span>
      </div>
      <div class="border rounded px-4 py-2 text-sm">
        <span class="text-gray-500">🔴 Kritis</span>
        <span class="ml-2 font-bold text-red-600">{{ critCount }}</span>
      </div>
      <div class="ml-auto flex items-center gap-2 text-sm text-gray-400">
        Auto-refresh {{ countdownSec }}d
        <div class="w-24 h-1 bg-gray-100 rounded overflow-hidden">
          <div
            class="h-full bg-green-500 transition-all duration-1000 ease-linear"
            :style="{ width: (countdownSec / 30) * 100 + '%' }"
          ></div>
        </div>
        <span>{{ lastFetch }}</span>
        <button
          @click="manualRefresh"
          class="ml-1 text-xs text-blue-500 hover:underline"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- ── Error / warning partial ── -->
    <div v-if="convError" class="mb-3 text-sm text-red-600">
      ⚠ {{ convError }}
    </div>
    <div v-if="pageErrors.length" class="mb-3 text-sm text-amber-600">
      Gagal: {{ pageErrors.join(", ") }}
    </div>

    <!-- ── Filter page + threshold ── -->
    <div class="mb-3 flex flex-wrap items-center gap-3 text-sm">
      <!-- Filter -->
      <div class="flex items-center gap-1 flex-wrap">
        <button
          @click="selectedPage = null"
          class="px-3 py-1 rounded border text-xs"
          :class="
            selectedPage === null
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          "
        >
          Semua ({{ conversations.length }})
        </button>
        <button
          v-for="p in pageGroups"
          :key="p.page_id"
          @click="selectedPage = p.page_id"
          class="px-3 py-1 rounded border text-xs"
          :class="
            selectedPage === p.page_id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          "
        >
          {{ p.page_name }} ({{ p.count }})
        </button>
      </div>

      <!-- Threshold -->
      <div class="flex items-center gap-2 text-gray-600 text-xs ml-auto">
        Warning:
        <input
          v-model.number="warnMin"
          type="number"
          min="1"
          max="60"
          class="w-12 border rounded px-1 py-0.5 text-center text-xs"
        />
        m | Kritis:
        <input
          v-model.number="critMin"
          type="number"
          min="1"
          max="120"
          class="w-12 border rounded px-1 py-0.5 text-center text-xs"
        />
        m
      </div>
    </div>

    <!-- ── Conversation Cards ── -->
    <div class="flex flex-col gap-2 mb-8">
      <!-- Loading skeleton -->
      <template v-if="loadingConv && filtered.length === 0">
        <div
          v-for="i in 4"
          :key="i"
          class="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 animate-pulse"
        >
          <div class="w-10 h-10 rounded-full bg-gray-100 shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3 bg-gray-100 rounded w-1/3"></div>
            <div class="h-3 bg-gray-100 rounded w-2/3"></div>
            <div class="h-2 bg-gray-100 rounded w-1/4"></div>
          </div>
          <div class="w-14 h-6 bg-gray-100 rounded shrink-0"></div>
        </div>
      </template>

      <!-- Empty state -->
      <div
        v-else-if="filtered.length === 0"
        class="bg-white border border-gray-100 rounded-xl py-12 text-center text-gray-400 text-sm"
      >
        <div class="text-3xl mb-2">✅</div>
        Semua chat sudah terbaca 🎉
      </div>

      <!-- Cards -->
      <a
        v-else
        v-for="c in filtered"
        :key="c.id"
        :href="c.conversation_link || undefined"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-300 no-underline"
        :class="{
          'bg-white border-green-200 hover:border-green-300 hover:bg-green-50/30':
            getLevel(c.unread_since) === 'ok',
          'bg-amber-50 border-amber-200 hover:border-amber-300':
            getLevel(c.unread_since) === 'warn',
          'bg-red-50   border-red-200   hover:border-red-300':
            getLevel(c.unread_since) === 'crit',
        }"
      >
        <!-- Avatar inisial -->
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border"
          :class="{
            'bg-green-50  text-green-600  border-green-200':
              getLevel(c.unread_since) === 'ok',
            'bg-amber-100 text-amber-600  border-amber-200':
              getLevel(c.unread_since) === 'warn',
            'bg-red-100   text-red-600    border-red-200':
              getLevel(c.unread_since) === 'crit',
          }"
        >
          {{ getInitials(c.name) }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-sm font-semibold text-gray-800 truncate">{{
              c.name
            }}</span>
            <span
              class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium shrink-0"
              >{{ c.page_name }}</span
            >
          </div>
          <p class="text-xs text-gray-500 truncate mt-0.5">{{ c.msg }}</p>
          <p class="text-xs text-gray-400 mt-0.5">+{{ c.phone }}</p>
        </div>

        <!-- Timer -->
        <div class="text-right shrink-0">
          <div
            class="text-xl font-bold font-mono leading-none"
            :class="{
              'text-green-600': getLevel(c.unread_since) === 'ok',
              'text-amber-500': getLevel(c.unread_since) === 'warn',
              'text-red-500': getLevel(c.unread_since) === 'crit',
            }"
            :style="
              getLevel(c.unread_since) === 'crit'
                ? 'animation: blink 1s step-end infinite'
                : ''
            "
          >
            {{ formatTimer(c.unread_since) }}
          </div>
          <div class="text-xs text-gray-400 mt-1">belum dibalas</div>
        </div>
      </a>
    </div>
    <!-- ── Master WA Pages (Superadmin only) ── -->
    <template v-if="isSuperadmin">
      <div class="mb-4 flex items-center gap-2">
        <h2 class="font-semibold">Master WA Pages</h2>
        <button
          @click="openForm()"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          + Tambah
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm border">
          <thead class="bg-gray-100">
            <tr>
              <th class="border px-2 py-1">Nama</th>
              <th class="border px-2 py-1">Nomor WA</th>
              <th class="border px-2 py-1">Tipe</th>
              <th class="border px-2 py-1">Status</th>
              <th class="border px-2 py-1">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingPages">
              <td
                colspan="5"
                class="border px-2 py-4 text-center text-gray-400"
              >
                Memuat...
              </td>
            </tr>
            <tr v-else-if="waPages.length === 0">
              <td
                colspan="5"
                class="border px-2 py-4 text-center text-gray-400"
              >
                Belum ada data.
              </td>
            </tr>
            <tr v-for="p in waPages" :key="p.id" class="hover:bg-gray-50">
              <td class="border px-2 py-1">{{ p.name }}</td>
              <td class="border px-2 py-1 font-mono text-xs">
                {{ p.phone_number }}
              </td>
              <td class="border px-2 py-1">{{ p.type }}</td>
              <td class="border px-2 py-1 text-center">
                <span
                  class="text-xs px-2 py-0.5 rounded"
                  :class="
                    p.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  "
                  >{{ p.is_active ? "Aktif" : "Nonaktif" }}</span
                >
              </td>
              <td class="border px-2 py-1 text-center">
                <div class="flex justify-center gap-2">
                  <button
                    @click="openForm(p)"
                    class="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    @click="deletePage(p)"
                    class="text-xs text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>

  <!-- ── Modal Form ── -->
  <TransitionRoot as="template" :show="formVisible">
    <Dialog class="relative z-10" @close="formVisible = false">
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

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
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
                  {{
                    formMode === "create" ? "Tambah WA Page" : "Edit WA Page"
                  }}
                </DialogTitle>

                <div class="flex flex-col space-y-3">
                  <!-- Nama -->
                  <div>
                    <label class="block text-xs text-gray-500 mb-1"
                      >Nama Page</label
                    >
                    <input
                      v-model="form.name"
                      type="text"
                      placeholder="CS Official, Reseller Line, dst."
                      class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">
                      {{ formErrors.name }}
                    </p>
                  </div>

                  <!-- Phone Number -->
                  <div>
                    <label class="block text-xs text-gray-500 mb-1"
                      >Nomor WA</label
                    >
                    <input
                      v-model="form.phone_number"
                      type="text"
                      placeholder="628xxxxxxxxxx"
                      class="w-full border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p class="text-xs text-gray-400 mt-1">
                      Cukup angka saja. Official →
                      <code class="bg-gray-100 px-1 rounded">waba_xxx</code>
                      &nbsp;|&nbsp; Non-Official →
                      <code class="bg-gray-100 px-1 rounded">wa_xxx@c.us</code>
                    </p>
                    <p
                      v-if="formErrors.phone_number"
                      class="text-xs text-red-500 mt-1"
                    >
                      {{ formErrors.phone_number }}
                    </p>
                  </div>

                  <!-- Tipe -->
                  <div>
                    <label class="block text-xs text-gray-500 mb-1">Tipe</label>
                    <input
                      v-model="form.type"
                      type="text"
                      placeholder="Official, Non-Official, Instagram, dll."
                      class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p v-if="formErrors.type" class="text-xs text-red-500 mt-1">
                      {{ formErrors.type }}
                    </p>
                  </div>

                  <!-- Status aktif -->
                  <div class="flex items-center gap-3">
                    <label class="text-sm text-gray-700">Status Aktif</label>
                    <input
                      v-model="form.is_active"
                      type="checkbox"
                      class="w-4 h-4"
                    />
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-col space-y-2 pt-1">
                    <button
                      @click="submitForm"
                      :disabled="formLoading"
                      class="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      {{
                        formLoading
                          ? "Menyimpan..."
                          : formMode === "create"
                            ? "Simpan"
                            : "Update"
                      }}
                    </button>
                    <button
                      @click="formVisible = false"
                      :disabled="formLoading"
                      class="w-full rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
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

const API_BASE = import.meta.env.VITE_API_BASE;
const auth = useAuthStore();

const userName = computed(() => auth.user?.name ?? "-");
const isSuperadmin = computed(() => auth.role === "Superadmin");

/* ── Monitor state ── */
const conversations = ref([]);
const loadingConv = ref(false);
const convError = ref("");
const pageErrors = ref([]);
const countdownSec = ref(30);
const lastFetch = ref("-");
const warnMin = ref(5);
const critMin = ref(15);
const selectedPage = ref(null);

let countdownTimer = null;
let tickTimer = null;

/* ── Master pages state ── */
const waPages = ref([]);
const loadingPages = ref(false);
const formVisible = ref(false);
const formMode = ref("create");
const formLoading = ref(false);
const formErrors = ref({});
const editingId = ref(null);

const defaultForm = () => ({
  name: "",
  phone_number: "",
  type: "",
  is_active: true,
});
const form = ref(defaultForm());

/* ── Helpers ── */
function getInitials(name) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getLevel(sinceMs) {
  const min = (Date.now() - sinceMs) / 60000;
  if (min >= critMin.value) return "crit";
  if (min >= warnMin.value) return "warn";
  return "ok";
}

function formatTimer(sinceMs) {
  const totalSec = Math.max(0, Math.floor((Date.now() - sinceMs) / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}j ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}d`;
  return `${s}d`;
}

/* ── Computed ── */
const sorted = computed(() =>
  [...conversations.value].sort((a, b) => a.unread_since - b.unread_since),
);

const filtered = computed(() =>
  selectedPage.value === null
    ? sorted.value
    : sorted.value.filter((c) => c.page_id === selectedPage.value),
);

const pageGroups = computed(() => {
  const map = {};
  conversations.value.forEach((c) => {
    if (!map[c.page_id])
      map[c.page_id] = {
        page_id: c.page_id,
        page_name: c.page_name,
        page_type: c.page_type,
        count: 0,
      };
    map[c.page_id].count++;
  });
  return Object.values(map).sort((a, b) => {
    if (a.page_type === b.page_type)
      return a.page_name.localeCompare(b.page_name);
    return a.page_type === "Official" ? -1 : 1;
  });
});

const warnCount = computed(
  () =>
    conversations.value.filter((c) => getLevel(c.unread_since) === "warn")
      .length,
);
const critCount = computed(
  () =>
    conversations.value.filter((c) => getLevel(c.unread_since) === "crit")
      .length,
);

/* ── Tick live timer ── */
function startTick() {
  tickTimer = setInterval(() => {
    conversations.value = [...conversations.value];
  }, 1000);
}

/* ── Countdown ── */
function startCountdown() {
  countdownSec.value = 30;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdownSec.value--;
    if (countdownSec.value <= 0) {
      countdownSec.value = 30;
      fetchConversations();
    }
  }, 1000);
}

/* ── Fetch conversations ── */
async function fetchConversations() {
  loadingConv.value = true;
  convError.value = "";
  pageErrors.value = [];
  try {
    const { data } = await axios.get(`${API_BASE}/wa-monitor/conversations`);
    conversations.value = data.data ?? [];
    pageErrors.value = data.errors ?? [];
  } catch (err) {
    convError.value =
      err.response?.data?.error ?? err.message ?? "Gagal mengambil data.";
  } finally {
    loadingConv.value = false;
    lastFetch.value = new Date().toLocaleTimeString("id-ID");
    startCountdown();
  }
}

function manualRefresh() {
  countdownSec.value = 30;
  fetchConversations();
}

/* ── Fetch master pages ── */
async function fetchPages() {
  if (!isSuperadmin.value) return;
  loadingPages.value = true;
  try {
    const { data } = await axios.get(`${API_BASE}/wa-monitor/pages`);
    waPages.value = data;
  } catch {
    //
  } finally {
    loadingPages.value = false;
  }
}

/* ── Form ── */
function openForm(page = null) {
  formErrors.value = {};
  if (page) {
    formMode.value = "edit";
    editingId.value = page.id;
    form.value = {
      name: page.name,
      phone_number: page.phone_number,
      type: page.type,
      is_active: page.is_active,
    };
  } else {
    formMode.value = "create";
    editingId.value = null;
    form.value = defaultForm();
  }
  formVisible.value = true;
}

async function submitForm() {
  formErrors.value = {};
  formLoading.value = true;
  try {
    if (formMode.value === "create") {
      await axios.post(`${API_BASE}/wa-monitor/pages`, form.value);
    } else {
      await axios.put(
        `${API_BASE}/wa-monitor/pages/${editingId.value}`,
        form.value,
      );
    }
    formVisible.value = false;
    fetchPages();
    fetchConversations();
  } catch (err) {
    if (err.response?.status === 422) {
      const errs = err.response.data.errors ?? {};
      formErrors.value = Object.fromEntries(
        Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
      );
    }
  } finally {
    formLoading.value = false;
  }
}

/* ── Delete ── */
async function deletePage(page) {
  if (!confirm(`Hapus "${page.name}"?`)) return;
  try {
    await axios.delete(`${API_BASE}/wa-monitor/pages/${page.id}`);
    fetchPages();
    fetchConversations();
  } catch {
    alert("Gagal menghapus.");
  }
}

/* ── Lifecycle ── */
onMounted(() => {
  fetchConversations();
  fetchPages();
  startTick();
});

onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer);
  if (tickTimer) clearInterval(tickTimer);
});
</script>

<style scoped>
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
