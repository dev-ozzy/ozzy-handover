<!-- src/views/WaMonitorView.vue -->
<template>
  <div class="p-6">
    <!-- ── Header ── -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold text-gray-800">
        WA Monitor
        <span class="text-gray-400 font-normal text-lg">— {{ userName }}</span>
      </h1>
    </div>

    <!-- ── Tabs ── -->
    <div class="flex gap-0 mb-6 border-b border-gray-200">
      <button
        @click="activeTab = 'monitor'"
        class="px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px"
        :class="
          activeTab === 'monitor'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        "
      >
        📊 Monitor
      </button>
      <button
        v-if="isSuperadmin"
        @click="activeTab = 'pages'"
        class="px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px"
        :class="
          activeTab === 'pages'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        "
      >
        ⚙️ Master WA Pages
      </button>
    </div>

    <!-- ══════════════════════════════════════════════ TAB: MONITOR ══ -->
    <template v-if="activeTab === 'monitor'">
      <!-- ── Stats ── -->
      <div class="flex gap-3 mb-4 flex-wrap">
        <button
          @click="
            filterLevel = null;
            selectPage(null);
          "
          class="border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white transition-all"
          :class="
            filterLevel || selectedPage
              ? 'hover:bg-gray-50 border-gray-400 ring-1 ring-gray-300'
              : 'cursor-default'
          "
        >
          <span class="text-gray-400">Total Unread</span>
          <span class="ml-2 font-bold text-gray-700">{{
            conversations.length
          }}</span>
          <span
            v-if="filterLevel || selectedPage"
            class="ml-1.5 text-xs text-gray-400"
            >✕</span
          >
        </button>
        <button
          @click="filterLevel = filterLevel === 'warn' ? null : 'warn'"
          class="border rounded-lg px-4 py-2.5 text-sm transition-all"
          :class="
            filterLevel === 'warn'
              ? 'bg-amber-100 border-amber-400'
              : 'bg-white hover:bg-amber-50 border-gray-200'
          "
        >
          <span class="text-gray-400">⚠ Perlu Dibalas</span>
          <span class="ml-2 font-bold text-amber-500">{{ warnCount }}</span>
        </button>
        <button
          @click="filterLevel = filterLevel === 'crit' ? null : 'crit'"
          class="border rounded-lg px-4 py-2.5 text-sm transition-all"
          :class="
            filterLevel === 'crit'
              ? 'bg-red-100 border-red-400'
              : 'bg-white hover:bg-red-50 border-gray-200'
          "
        >
          <span class="text-gray-400">🔴 Kritis</span>
          <span class="ml-2 font-bold text-red-600">{{ critCount }}</span>
        </button>
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
        <div class="flex items-center gap-1 flex-wrap">
          <button
            @click="selectPage(null)"
            class="px-3 py-1 rounded border text-xs"
            :class="
              selectedPage === null
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            "
          >
            Semua ({{
              filterLevel
                ? conversations.filter(
                    (c) => getLevel(c.unread_since) === filterLevel,
                  ).length
                : conversations.length
            }})
          </button>
          <button
            v-for="p in pageGroups"
            :key="p.page_id"
            @click="selectPage(p.page_id)"
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
        <div class="flex items-center gap-2 text-gray-600 text-xs ml-auto">
          Warning:
          <input
            v-model.number="warnMin"
            @change="saveSettings"
            type="number"
            min="1"
            max="60"
            class="w-12 border rounded px-1 py-0.5 text-center text-xs"
          />
          m | Kritis:
          <input
            v-model.number="critMin"
            @change="saveSettings"
            type="number"
            min="1"
            max="120"
            class="w-12 border rounded px-1 py-0.5 text-center text-xs"
          />
          m | Refresh:
          <input
            v-model.number="refreshInterval"
            @change="saveSettings"
            type="number"
            min="10"
            max="300"
            class="w-14 border rounded px-1 py-0.5 text-center text-xs"
          />
          d
        </div>
      </div>

      <!-- ── Conversation Cards ── -->
      <div class="flex flex-col gap-2 mb-8">
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

        <div
          v-else-if="filtered.length === 0"
          class="bg-white border border-gray-100 rounded-xl py-12 text-center text-gray-400 text-sm"
        >
          <div class="text-3xl mb-2">✅</div>
          Semua chat sudah terbaca 🎉
        </div>

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
    </template>

    <!-- ══════════════════════════════════════════════ TAB: MASTER PAGES ══ -->
    <template v-if="activeTab === 'pages' && isSuperadmin">
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-gray-500">
          Kelola nomor WA yang dimonitor beserta jam kerjanya.
        </p>
        <button
          @click="openForm()"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          + Tambah Page
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-gray-200">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                Nama
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                Nomor WA
              </th>
              <th
                class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                Tipe
              </th>
              <th
                class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                Jam Kerja
              </th>
              <th
                class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                Status
              </th>
              <th
                class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="loadingPages">
              <td colspan="6" class="px-4 py-8 text-center text-gray-400">
                Memuat...
              </td>
            </tr>
            <tr v-else-if="waPages.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-400">
                Belum ada data.
              </td>
            </tr>
            <tr
              v-for="p in waPages"
              :key="p.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 font-medium text-gray-800">{{ p.name }}</td>
              <td class="px-4 py-3 font-mono text-xs text-gray-600">
                {{ p.phone_number }}
              </td>
              <td class="px-4 py-3 text-gray-600">{{ p.type }}</td>
              <td class="px-4 py-3 text-center font-mono text-xs text-gray-600">
                {{ p.work_start }} – {{ p.work_end }}
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="
                    p.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  "
                >
                  {{ p.is_active ? "Aktif" : "Nonaktif" }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex justify-center gap-3">
                  <button
                    @click="openForm(p)"
                    class="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <button
                    @click="deletePage(p)"
                    class="text-xs text-red-500 hover:underline font-medium"
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
              class="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md"
            >
              <div class="bg-white px-6 py-6">
                <DialogTitle
                  as="h3"
                  class="text-lg font-semibold text-gray-900 mb-5 text-center"
                >
                  {{
                    formMode === "create" ? "Tambah WA Page" : "Edit WA Page"
                  }}
                </DialogTitle>

                <div class="flex flex-col space-y-4">
                  <!-- Nama -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1"
                      >Nama Page</label
                    >
                    <input
                      v-model="form.name"
                      type="text"
                      placeholder="CS Official, Reseller Line, dst."
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p v-if="formErrors.name" class="text-xs text-red-500 mt-1">
                      {{ formErrors.name }}
                    </p>
                  </div>

                  <!-- Phone Number -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1"
                      >Nomor WA</label
                    >
                    <input
                      v-model="form.phone_number"
                      type="text"
                      placeholder="628xxxxxxxxxx"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label class="block text-xs font-medium text-gray-500 mb-1"
                      >Tipe</label
                    >
                    <select
                      v-model="form.type"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="" disabled>Pilih tipe...</option>
                      <option value="Official">Official</option>
                      <option value="Non-Official">Non-Official</option>
                    </select>
                    <p v-if="formErrors.type" class="text-xs text-red-500 mt-1">
                      {{ formErrors.type }}
                    </p>
                  </div>

                  <!-- Jam Kerja -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1"
                      >Jam Kerja</label
                    >
                    <div class="flex items-center gap-2">
                      <input
                        v-model="form.work_start"
                        type="time"
                        class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span class="text-gray-400 text-sm">–</span>
                      <input
                        v-model="form.work_end"
                        type="time"
                        class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p
                      v-if="formErrors.work_start || formErrors.work_end"
                      class="text-xs text-red-500 mt-1"
                    >
                      {{ formErrors.work_start || formErrors.work_end }}
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
                  <div class="flex gap-2 pt-1">
                    <button
                      @click="formVisible = false"
                      :disabled="formLoading"
                      class="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      @click="submitForm"
                      :disabled="formLoading"
                      class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {{
                        formLoading
                          ? "Menyimpan..."
                          : formMode === "create"
                            ? "Simpan"
                            : "Update"
                      }}
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

/* ── Tab ── */
const activeTab = ref("monitor");

/* ── Monitor state ── */
const conversations = ref([]);
const loadingConv = ref(false);
const convError = ref("");
const pageErrors = ref([]);
const refreshInterval = ref(30); // dari DB
const countdownSec = ref(30);
const lastFetch = ref("-");
const warnMin = ref(5);
const critMin = ref(15);
const selectedPage = ref(null);
const filterLevel = ref(null); // null | 'warn' | 'crit'

let countdownTimer = null;
let tickTimer = null;
let saveTimeout = null;

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
  work_start: "09:00",
  work_end: "17:00",
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

function selectPage(id) {
  selectedPage.value = id;
  filterLevel.value = null;
}

/* ── Computed ── */
const sorted = computed(() =>
  [...conversations.value].sort((a, b) => a.unread_since - b.unread_since),
);

const filtered = computed(() => {
  let result =
    selectedPage.value === null
      ? sorted.value
      : sorted.value.filter((c) => c.page_id === selectedPage.value);
  if (filterLevel.value) {
    result = result.filter(
      (c) => getLevel(c.unread_since) === filterLevel.value,
    );
  }
  return result;
});

const pageGroups = computed(() => {
  // Daftar pages selalu dari SEMUA conversations (tanpa filter level)
  const allMap = {};
  conversations.value.forEach((c) => {
    if (!allMap[c.page_id])
      allMap[c.page_id] = {
        page_id: c.page_id,
        page_name: c.page_name,
        page_type: c.page_type,
        count: 0,
      };
  });

  // Count-nya baru pakai filter level
  const source = filterLevel.value
    ? conversations.value.filter(
        (c) => getLevel(c.unread_since) === filterLevel.value,
      )
    : conversations.value;

  source.forEach((c) => {
    if (allMap[c.page_id]) allMap[c.page_id].count++;
  });

  return Object.values(allMap).sort((a, b) => {
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
  countdownSec.value = refreshInterval.value;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    countdownSec.value--;
    if (countdownSec.value <= 0) {
      countdownSec.value = refreshInterval.value;
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
  countdownSec.value = refreshInterval.value;
  fetchConversations();
}

/* ── Settings ── */
async function fetchSettings() {
  try {
    const { data } = await axios.get(`${API_BASE}/wa-monitor/settings`);
    warnMin.value = data.warn_minutes;
    critMin.value = data.crit_minutes;
    refreshInterval.value = data.refresh_interval ?? 30;
    countdownSec.value = refreshInterval.value;
  } catch {
    /* pakai default */
  }
}

async function saveSettings() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await axios.patch(`${API_BASE}/wa-monitor/settings`, {
        warn_minutes: warnMin.value,
        crit_minutes: critMin.value,
        refresh_interval: refreshInterval.value,
      });
    } catch {
      /* silent */
    }
  }, 800);
}

/* ── Fetch master pages ── */
async function fetchPages() {
  if (!isSuperadmin.value) return;
  loadingPages.value = true;
  try {
    const { data } = await axios.get(`${API_BASE}/wa-monitor/pages`);
    waPages.value = data;
  } catch {
    /**/
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
      work_start: page.work_start?.slice(0, 5) ?? "08:00",
      work_end: page.work_end?.slice(0, 5) ?? "17:00",
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
  fetchSettings();
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
