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
        @click="activeTab = 'labels'"
        class="px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px"
        :class="
          activeTab === 'labels'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        "
      >
        🏷️ Label Grouping
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
      <button
        v-if="isSuperadmin"
        @click="activeTab = 'tag-trigger'"
        class="px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px"
        :class="
          activeTab === 'tag-trigger'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        "
      >
        🎯 Tag Trigger
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
            unreadCount
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
                    (c) => c.unread_since && getLevel(c.unread_since) === filterLevel,
                  ).length
                : unreadCount
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
              <span
                v-for="tag in getConversationTagIds(c)"
                :key="tag"
                class="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium shrink-0"
              >
                {{ getTagLabel(tag) }}
              </span>
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

    <!-- ══════════════════════════════════════════════ TAB: LABEL GROUPING ══ -->
    <template v-if="activeTab === 'labels'">
      <div class="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">Label Grouping</h2>
          <p class="text-sm text-gray-500">
            {{ totalIndexed.toLocaleString('id') }} chat terindeks<span v-if="lastSync !== '-'"> · sync {{ lastSync }}</span>
          </p>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <button
            @click="refreshLabeled"
            :disabled="loadingLabeled"
            class="rounded border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            {{ loadingLabeled ? "Memuat..." : "Refresh" }}
          </button>
        </div>
      </div>

      <div v-if="labeledError" class="mb-3 text-sm text-red-600">⚠ {{ labeledError }}</div>

      <div v-if="labelReorderError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ labelReorderError }}
      </div>

      <!-- ── Page selector pills ── -->
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <button
          @click="labelFilterCabang = []"
          class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
          :class="labelFilterCabang.length === 0
            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'"
        >
          Semua
        </button>
        <button
          v-for="pageName in cabangFilterOptions"
          :key="pageName"
          @click="labelFilterCabang = [pageName]"
          class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
          :class="labelFilterCabang.length === 1 && labelFilterCabang[0] === pageName
            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'"
        >
          {{ pageName }}
        </button>
      </div>

      <div class="mb-4 grid gap-3 rounded-xl border border-gray-200 bg-white p-3 md:grid-cols-4">
        <MultiSelect
          v-model="labelFilterFlow"
          :options="flowFilterOptions"
          label="By flow"
          placeholder="Pilih flow..."
        />
        <MultiSelect
          v-model="labelFilterCabang"
          :options="cabangFilterOptions"
          label="By cabang"
          placeholder="Pilih cabang..."
        />
        <MultiSelect
          v-model="labelFilterInformation"
          :options="informationFilterOptions"
          label="By sumber"
          placeholder="Pilih sumber..."
        />
        <MultiSelect
          v-model="labelFilterHandleBy"
          :options="handleByFilterOptions"
          label="By handle by (assignee)"
          placeholder="Pilih assignee..."
        />
      </div>

      <div
        v-if="loadingLabeled && !labelGroups.length"
        class="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-6 text-center text-sm text-blue-600"
      >
        <div class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"></div>
        Memuat label grouping...
      </div>

      <section v-if="isSuperadmin && unassigned.length" class="mb-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 p-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-gray-400"></span>
              <h3 class="text-base font-semibold text-gray-900">Label Belum Masuk Flow</h3>
            </div>
            <p class="text-xs text-gray-500">
              Label yang belum dipetakan ke Deal Maker atau Back End.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
              {{ unassigned.length }} total
            </span>
            <button
              type="button"
              @click="unassignedOpen = !unassignedOpen"
              class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              {{ unassignedOpen ? 'Tutup' : 'Buka' }}
            </button>
          </div>
        </div>

        <draggable
          v-if="unassignedOpen"
          v-model="unassigned"
          item-key="id"
          handle=".drag-handle"
          ghost-class="opacity-50"
          :group="{ name: 'labels' }"
          class="mt-3 flex flex-col gap-3 min-h-[2rem]"
          @end="saveLabelReorder"
        >
          <template #item="{ element: label }">
            <div
              class="rounded-xl border p-3 transition-colors"
              :class="getLabelCardClass(label)"
            >
              <button
                type="button"
                @click="toggleFlowGroup(label.name)"
                class="flex w-full items-center justify-between gap-2 text-left"
              >
                <div class="flex items-center gap-2 font-semibold text-gray-800">
                  <span
                    v-if="isSuperadmin"
                    class="drag-handle cursor-grab text-gray-400 select-none"
                  >⠿</span>
                  <span class="h-2.5 w-2.5 rounded-full" :class="getLabelDotClass(label)"></span>
                  <span>{{ label.name }}</span>
                  <span class="text-gray-500">({{ getLabelCountText(label) }})</span>
                </div>
                <span class="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-gray-700">
                  {{ isFlowGroupOpen(label.name) ? 'Tutup' : 'Buka' }}
                </span>
              </button>

              <template v-if="isFlowGroupOpen(label.name)">
                <div v-if="getLabelItems(label).length || isLabelLoading(label.name) || getLabelError(label.name)" class="mt-3 flex flex-col gap-2">
                  <div class="hidden md:grid md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_4rem_4.5rem_3.5rem_4rem_4rem] gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                    <div></div>
                    <div></div>
                    <div>CABANG</div>
                    <div>HANDLE BY</div>
                    <div>INFO</div>
                    <div>UNREAD</div>
                    <div>FLOW</div>
                    <div>TOTAL FLOW</div>
                  </div>
                  <div
                    v-for="c in getLabelItems(label)"
                    :key="`${label.name}-${c.id}`"
                    class="rounded-lg border border-white/80 bg-white/80 shadow-sm"
                  >
                    <a
                      :href="c.conversation_link || undefined"
                      target="_blank"
                      rel="noopener"
                      class="grid gap-1.5 px-3 py-2 no-underline hover:bg-white rounded-lg md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_4rem_4.5rem_3.5rem_4rem_4rem]"
                    >
                      <div
                        class="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                        :class="getLabelAvatarClass(label)"
                      >
                        {{ getInitials(c.name) }}
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="truncate text-sm font-semibold text-gray-800">{{ c.name }}</span>
                        </div>
                        <p class="truncate text-xs text-gray-500 mt-0.5">{{ c.msg }}</p>
                      </div>
                      <div class="min-w-0">
                        <span class="text-xs text-gray-600 truncate block">{{ c.page_name || '-' }}</span>
                      </div>
                      <div class="min-w-0">
                        <div v-if="getHandleBy(c).length" class="flex gap-0.5 items-center">
                          <div
                            v-for="name in getHandleBy(c)"
                            :key="`${c.id}-${name}`"
                            class="relative group"
                          >
                            <span
                              class="rounded-full bg-purple-100 px-1.5 py-0.5 text-[11px] font-semibold text-purple-700 truncate max-w-full cursor-default"
                            >{{ name.split(' ')[0] }}</span>
                            <div
                              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-gray-800 text-white text-[10px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >{{ name }}</div>
                          </div>
                        </div>
                        <span v-else class="text-xs text-gray-400">-</span>
                      </div>
                      <div class="min-w-0">
                        <div v-if="getInformationLabels(c).length" class="flex flex-wrap gap-1">
                          <span
                            v-for="infoLabel in getInformationLabels(c)"
                            :key="`${c.id}-${infoLabel}`"
                            class="rounded-full bg-sky-100 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700 truncate max-w-full"
                          >{{ infoLabel }}</span>
                        </div>
                        <span v-else class="text-xs text-gray-400">-</span>
                      </div>
                      <div class="text-right">
                        <span class="text-xs font-mono font-semibold text-gray-500">{{ formatTimer(c.unread_since) }}</span>
                      </div>
                      <div class="text-right">
                        <span
                          v-if="getLabelDurationSince(c, label)"
                          class="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap"
                        >
                          {{ formatTimer(getLabelDurationSince(c, label)) }}
                        </span>
                        <span v-else class="text-xs text-gray-400">-</span>
                      </div>
                      <div class="text-right">
                        <span
                          v-if="getTotalFlow(c)"
                          class="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap"
                        >
                          {{ formatDurationMs(getTotalFlow(c)) }}
                        </span>
                        <span v-else class="text-xs text-gray-400">-</span>
                        <button
                          type="button"
                          @click.prevent="toggleHistory(c.id)"
                          class="block ml-auto text-[11px] text-indigo-500 hover:text-indigo-700 hover:underline mt-1"
                        >
                          {{ historyOpen[c.id] ? '▲ history' : '▼ history' }}
                        </button>
                      </div>
                    </a>

                    <!-- History panel -->
                    <div v-if="historyOpen[c.id]" class="border-t border-gray-100 px-3 py-2">
                      <div v-if="!historyData[c.id]" class="text-xs text-gray-400">Memuat...</div>
                      <div v-else-if="historyData[c.id].history?.length === 0" class="text-xs text-gray-400">Belum ada history.</div>
                      <div v-else class="flex flex-col gap-1">
                        <div class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Riwayat Flow</div>
                        <template v-for="(cycleGroup, ci) in (historyData[c.id].cycles || [{ rows: historyData[c.id].history || [], cycle: 1 }])" :key="ci">
                          <div v-if="historyData[c.id].cycles && ci > 0" class="border-t border-gray-100 my-1"></div>
                          <div v-if="historyData[c.id].cycles" class="flex items-center gap-2 text-[11px] font-semibold tracking-wide">
                            <span class="text-indigo-500">Putaran {{ cycleGroup.cycle }}</span>
                            <span class="ml-auto text-gray-500 font-normal">{{ formatDurationMs(cycleGroup.cycle_total_ms) }}</span>
                          </div>
                          <div
                            v-for="(row, j) in cycleGroup.rows"
                            :key="j"
                            class="flex items-center gap-2 text-xs"
                          >
                            <span class="w-2 h-2 rounded-full shrink-0"
                              :class="row.exited_at ? 'bg-gray-300' : 'bg-green-400'"></span>
                            <span class="font-semibold text-gray-700 w-24 shrink-0">{{ row.label_name }}</span>
                            <span class="text-gray-400">
                              {{ new Date(row.entered_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short' }) }}
                              {{ new Date(row.entered_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) }}
                            </span>
                            <span class="text-gray-300">→</span>
                            <span class="text-gray-400">
                              {{ row.exited_at
                                ? new Date(row.exited_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })
                                : 'sekarang' }}
                            </span>
                            <span class="ml-auto font-semibold"
                              :class="row.exited_at ? 'text-gray-600' : 'text-amber-600'">
                              {{ formatDurationMs(row.duration_ms ?? (Date.now() - row.entered_at)) }}
                            </span>
                          </div>
                        </template>
                        <div v-if="historyData[c.id].total_ms" class="mt-1 flex justify-between border-t border-gray-100 pt-1 text-xs font-semibold">
                          <span class="text-gray-500">Total waktu</span>
                          <span class="text-indigo-600">{{ formatDurationMs(historyData[c.id].total_ms) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="isLabelLoading(label.name)" class="rounded-lg bg-white/70 py-3 text-center text-xs text-gray-400">
                    Memuat chat...
                  </div>
                  <div v-if="getLabelError(label.name)" class="rounded-lg bg-red-50 py-3 text-center text-xs text-red-600">
                    {{ getLabelError(label.name) }}
                  </div>
                  <button
                    v-if="hasMoreLabelRows(label) && !isLabelLoading(label.name)"
                    type="button"
                    @click="fetchLabelRows(label, true)"
                    class="self-center rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Tampilkan lagi ({{ getLabelItems(label).length }}+)
                  </button>
                </div>
                <div v-else class="mt-3 rounded-lg bg-gray-50 py-4 text-center text-xs text-gray-400">
                  Tidak ada chat untuk label ini.
                </div>
              </template>
            </div>
          </template>
        </draggable>
      </section>

      <section class="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="h-3 w-3 rounded-full bg-orange-500"></span>
              <h3 class="text-base font-semibold text-gray-900">Flow</h3>
            </div>
            <p class="text-xs text-gray-500">
              {{ labelFlowTotal }} chat dikelompokkan berdasarkan flow.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="openAllFlowGroups"
              class="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50"
            >
              Buka Semua
            </button>
            <button
              type="button"
              @click="closeAllFlowGroups"
              class="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50"
            >
              Tutup Semua
            </button>
            <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
              {{ labelFlowTotal }} total
            </span>
          </div>
        </div>

        <div class="grid gap-5 xl:grid-cols-2">
          <div
            v-for="section in labelGroups"
            :key="section.id"
            class="rounded-xl border border-white/80 bg-white/60 p-3 shadow-sm"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <h4 class="font-semibold text-gray-900">{{ section.name }}</h4>
              <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                {{ getSectionTotal(section) }} chat
              </span>
            </div>

            <draggable
              v-model="section.labels"
              item-key="id"
              handle=".drag-handle"
              ghost-class="opacity-50"
              :group="{ name: 'labels' }"
              class="flex flex-col gap-3 min-h-[2rem]"
              @end="saveLabelReorder"
            >
              <template #item="{ element: label }">
                <div
                  class="rounded-xl border p-3 transition-colors"
                  :class="getLabelCardClass(label)"
                >
                  <button
                    type="button"
                    @click="toggleFlowGroup(label.name)"
                    class="flex w-full items-center justify-between gap-2 text-left"
                  >
                    <div class="flex items-center gap-2 font-semibold text-gray-800">
                      <span
                        v-if="isSuperadmin"
                        class="drag-handle cursor-grab text-gray-400 select-none"
                      >⠿</span>
                      <span class="h-2.5 w-2.5 rounded-full" :class="getLabelDotClass(label)"></span>
                      <span>{{ label.name }}</span>
                      <span class="text-gray-500">({{ getLabelCountText(label) }})</span>
                    </div>
                    <span class="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {{ isFlowGroupOpen(label.name) ? 'Tutup' : 'Buka' }}
                    </span>
                  </button>

                  <div v-if="isFlowGroupOpen(label.name) && (getLabelItems(label).length || isLabelLoading(label.name) || getLabelError(label.name))" class="mt-3 flex flex-col gap-2">
                    <div class="hidden md:grid md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_4rem_4.5rem_3.5rem_4rem_4rem] gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 border-b border-gray-100">
                      <div></div>
                      <div></div>
                      <div>CABANG</div>
                      <div>HANDLE BY</div>
                      <div>INFO</div>
                      <div>UNREAD</div>
                      <div>FLOW</div>
                      <div>TOTAL FLOW</div>
                    </div>
                    <div
                      v-for="c in getLabelItems(label)"
                      :key="`${label.name}-${c.id}`"
                      class="rounded-lg border border-white/80 bg-white/80 shadow-sm"
                    >
                      <a
                        :href="c.conversation_link || undefined"
                        target="_blank"
                        rel="noopener"
                        class="grid gap-1.5 px-3 py-2 no-underline hover:bg-white rounded-lg md:grid-cols-[2.5rem_minmax(0,1fr)_5rem_4rem_4.5rem_3.5rem_4rem_4rem]"
                      >
                        <div
                          class="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0"
                          :class="getLabelAvatarClass(label)"
                        >
                          {{ getInitials(c.name) }}
                        </div>
                        <div class="min-w-0">
                          <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="truncate text-sm font-semibold text-gray-800">{{ c.name }}</span>
                          </div>
                          <p class="truncate text-xs text-gray-500 mt-0.5">{{ c.msg }}</p>
                        </div>
                        <div class="min-w-0">
                          <span class="text-xs text-gray-600 truncate block">{{ c.page_name || '-' }}</span>
                        </div>
                        <div class="min-w-0">
                          <div v-if="getHandleBy(c).length" class="flex gap-0.5 items-center">
                              <div
                                v-for="name in getHandleBy(c)"
                                :key="`${c.id}-${name}`"
                                class="relative group"
                              >
                                <span
                                  class="rounded-full bg-purple-100 px-1.5 py-0.5 text-[11px] font-semibold text-purple-700 truncate max-w-full cursor-default"
                                >{{ name.split(' ')[0] }}</span>
                                <div
                                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 rounded bg-gray-800 text-white text-[10px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >{{ name }}</div>
                              </div>
                            </div>
                            <span v-else class="text-xs text-gray-400">-</span>
                          </div>
                          <div class="min-w-0">
                            <div v-if="getInformationLabels(c).length" class="flex flex-wrap gap-1">
                              <span
                                v-for="infoLabel in getInformationLabels(c)"
                                :key="`${c.id}-${infoLabel}`"
                                class="rounded-full bg-sky-100 px-1.5 py-0.5 text-[11px] font-semibold text-sky-700 truncate max-w-full"
                              >{{ infoLabel }}</span>
                          </div>
                          <span v-else class="text-xs text-gray-400">-</span>
                        </div>
                        <div class="text-right">
                          <span class="text-xs font-mono font-semibold text-gray-500">{{ formatTimer(c.unread_since) }}</span>
                        </div>
                        <div class="text-right">
                          <span
                            v-if="getLabelDurationSince(c, label)"
                            class="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap"
                          >
                            {{ formatTimer(getLabelDurationSince(c, label)) }}
                          </span>
                          <span v-else class="text-xs text-gray-400">-</span>
                        </div>
                        <div class="text-right">
                          <span
                            v-if="getTotalFlow(c)"
                            class="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 whitespace-nowrap"
                          >
                            {{ formatDurationMs(getTotalFlow(c)) }}
                          </span>
                          <span v-else class="text-xs text-gray-400">-</span>
                          <button
                            type="button"
                            @click.prevent="toggleHistory(c.id)"
                            class="block ml-auto text-[11px] text-indigo-500 hover:text-indigo-700 hover:underline mt-1"
                          >
                            {{ historyOpen[c.id] ? '▲ history' : '▼ history' }}
                          </button>
                        </div>
                      </a>

                      <!-- History panel -->
                      <div v-if="historyOpen[c.id]" class="border-t border-gray-100 px-3 py-2">
                        <div v-if="!historyData[c.id]" class="text-xs text-gray-400">Memuat...</div>
                        <div v-else-if="historyData[c.id].history?.length === 0" class="text-xs text-gray-400">Belum ada history.</div>
                        <div v-else class="flex flex-col gap-1">
                          <div class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Riwayat Flow</div>
                          <template v-for="(cycleGroup, ci) in (historyData[c.id].cycles || [{ rows: historyData[c.id].history || [], cycle: 1 }])" :key="ci">
                            <div v-if="historyData[c.id].cycles && ci > 0" class="border-t border-gray-100 my-1"></div>
                            <div v-if="historyData[c.id].cycles" class="flex items-center gap-2 text-[11px] font-semibold tracking-wide">
                              <span class="text-indigo-500">Putaran {{ cycleGroup.cycle }}</span>
                              <span class="ml-auto text-gray-500 font-normal">{{ formatDurationMs(cycleGroup.cycle_total_ms) }}</span>
                            </div>
                            <div
                              v-for="(row, j) in cycleGroup.rows"
                              :key="j"
                              class="flex items-center gap-2 text-xs"
                            >
                              <span class="w-2 h-2 rounded-full shrink-0"
                                :class="row.exited_at ? 'bg-gray-300' : 'bg-green-400'"></span>
                              <span class="font-semibold text-gray-700 w-24 shrink-0">{{ row.label_name }}</span>
                              <span class="text-gray-400">
                                {{ new Date(row.entered_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short' }) }}
                                {{ new Date(row.entered_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) }}
                              </span>
                              <span class="text-gray-300">→</span>
                              <span class="text-gray-400">
                                {{ row.exited_at
                                  ? new Date(row.exited_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })
                                  : 'sekarang' }}
                              </span>
                              <span class="ml-auto font-semibold"
                                :class="row.exited_at ? 'text-gray-600' : 'text-amber-600'">
                                {{ formatDurationMs(row.duration_ms ?? (Date.now() - row.entered_at)) }}
                              </span>
                            </div>
                          </template>
                          <div v-if="historyData[c.id].total_ms" class="mt-1 flex justify-between border-t border-gray-100 pt-1 text-xs font-semibold">
                            <span class="text-gray-500">Total waktu</span>
                            <span class="text-indigo-600">{{ formatDurationMs(historyData[c.id].total_ms) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-if="isLabelLoading(label.name)" class="rounded-lg bg-white/70 py-3 text-center text-xs text-gray-400">
                      Memuat chat...
                    </div>
                    <div v-if="getLabelError(label.name)" class="rounded-lg bg-red-50 py-3 text-center text-xs text-red-600">
                      {{ getLabelError(label.name) }}
                    </div>
                    <button
                      v-if="hasMoreLabelRows(label) && !isLabelLoading(label.name)"
                      type="button"
                      @click="fetchLabelRows(label, true)"
                      class="self-center rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Tampilkan lagi ({{ getLabelItems(label).length }}+)
                    </button>
                  </div>
                  <div v-else-if="isFlowGroupOpen(label.name)" class="mt-3 rounded-lg bg-gray-50 py-4 text-center text-xs text-gray-400">
                    Tidak ada chat untuk label ini.
                  </div>
                </div>
              </template>
            </draggable>
          </div>

        </div>
      </section>

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

    <!-- ══════════════════════════════════════════════ TAB: TAG TRIGGER ══ -->
    <template v-if="activeTab === 'tag-trigger' && isSuperadmin">
      <div class="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">Tag Trigger</h2>
          <p class="text-sm text-gray-500">
            Aturan auto-tag berdasarkan teks pesan terakhir. Dijalankan tiap 5 menit.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="fetchAutoTagRules"
            :disabled="loadingRules"
            class="rounded border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
          >
            {{ loadingRules ? "Memuat..." : "Refresh" }}
          </button>
          <button
            @click="openRuleForm()"
            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            + Tambah Rule
          </button>
        </div>
      </div>

      <div v-if="rulesError" class="mb-3 text-sm text-red-600">⚠ {{ rulesError }}</div>

      <div class="overflow-x-auto rounded-xl border border-gray-200">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Urutan</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tag</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Trigger</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contains</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Not Contains</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Sumber</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-if="loadingRules && rules.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-gray-400">Memuat...</td>
            </tr>
            <tr v-else-if="rules.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-gray-400">Belum ada rule.</td>
            </tr>
            <tr v-for="r in rules" :key="r.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 text-center text-gray-500 font-mono text-xs">{{ r.sort_order }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {{ r.label || `Tag ${r.pancake_tag_id}` }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-700">
                <code v-if="r.trigger_text" class="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{{ r.trigger_text }}</code>
                <span v-else class="text-gray-400 text-xs">-</span>
              </td>
              <td class="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                {{ r.contains_any?.length ? r.contains_any.join(", ") : "-" }}
              </td>
              <td class="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                {{ r.not_contains_any?.length ? r.not_contains_any.join(", ") : "-" }}
              </td>
              <td class="px-4 py-3 text-center text-xs text-gray-600">{{ ruleSourceChat(r) }}</td>
              <td class="px-4 py-3 text-center">
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="r.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  {{ r.enabled ? "Aktif" : "Nonaktif" }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex justify-center gap-3">
                  <button @click="openRuleForm(r)" class="text-xs text-blue-600 hover:underline font-medium">Edit</button>
                  <button @click="deleteRule(r)" class="text-xs text-red-500 hover:underline font-medium">Hapus</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>

  <!-- ── Modal Tag Trigger Rule ── -->
  <TransitionRoot as="template" :show="ruleFormVisible">
    <Dialog class="relative z-10" @close="ruleFormVisible = false">
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
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
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
              class="relative transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              <div class="bg-white px-6 py-6">
                <DialogTitle as="h3" class="text-lg font-semibold text-gray-900 mb-5 text-center">
                  {{ ruleFormMode === "create" ? "Tambah Tag Trigger" : "Edit Tag Trigger" }}
                </DialogTitle>

                <div class="flex flex-col space-y-4">
                  <!-- Tag -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Tag</label>
                    <select
                      v-model.number="ruleForm.wa_monitor_label_id"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option :value="null" disabled>Pilih tag...</option>
                      <option v-for="l in ruleLabels" :key="l.id" :value="l.id">
                        {{ l.name }}
                      </option>
                    </select>
                    <p v-if="ruleFormErrors.wa_monitor_label_id" class="text-xs text-red-500 mt-1">
                      {{ ruleFormErrors.wa_monitor_label_id }}
                    </p>
                  </div>

                  <!-- Trigger text -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Trigger Text</label>
                    <input
                      v-model="ruleForm.trigger_text"
                      type="text"
                      placeholder="izin followup terkait dp"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p class="text-xs text-gray-400 mt-1">
                      Cocokkan jika pesan mengandung teks ini (case-insensitive).
                    </p>
                  </div>

                  <!-- Contains any -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Contains Any (opsional)</label>
                    <textarea
                      v-model="containsAnyText"
                      rows="2"
                      placeholder="Satu frasa per baris"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                    <p class="text-xs text-gray-400 mt-1">Cocok jika mengandung salah satu frasa. Satu per baris.</p>
                  </div>

                  <!-- Not contains any -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Not Contains Any (opsional)</label>
                    <textarea
                      v-model="notContainsAnyText"
                      rows="2"
                      placeholder="Satu frasa per baris"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                    <p class="text-xs text-gray-400 mt-1">Batalkan match jika mengandung salah satu frasa.</p>
                  </div>

                  <div>
                    <!-- Source chat -->
                    <label class="block text-xs font-medium text-gray-500 mb-1">Sumber Chat</label>
                    <select
                      v-model="ruleForm.source_chat"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="any">Semua</option>
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p class="text-xs text-gray-400 mt-1">Pilih pesan dari siapa yang akan dicek untuk trigger.</p>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <!-- Sort order -->
                    <div>
                      <label class="block text-xs font-medium text-gray-500 mb-1">Urutan</label>
                      <input
                        v-model.number="ruleForm.sort_order"
                        type="number"
                        min="0"
                        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <!-- Enabled -->
                    <div class="flex items-end pb-2">
                      <label class="flex items-center gap-2 text-sm text-gray-700">
                        <input v-model="ruleForm.enabled" type="checkbox" class="w-4 h-4" />
                        Aktif
                      </label>
                    </div>
                  </div>

                  <!-- Note -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Catatan (opsional)</label>
                    <input
                      v-model="ruleForm.condition_note"
                      type="text"
                      class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2 pt-1">
                    <button
                      @click="ruleFormVisible = false"
                      :disabled="ruleFormLoading"
                      class="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      @click="submitRuleForm"
                      :disabled="ruleFormLoading"
                      class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {{ ruleFormLoading ? "Menyimpan..." : ruleFormMode === "create" ? "Simpan" : "Update" }}
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import axios from "axios";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { useAuthStore } from "@/stores/auth";
import MultiSelect from "../Component/MultiSelect.vue";
import draggable from "vuedraggable";

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
const tagDebug = ref([]);
const tagErrors = ref([]);
const loadingTags = ref(false);
const loadingLabeled = ref(false);
const labeledError = ref("");
const totalIndexed = ref(0);
const lastSync = ref("-");
const labelRows = ref({});
const refreshInterval = ref(30); // dari DB
const countdownSec = ref(30);
const lastFetch = ref("-");
const warnMin = ref(5);
const critMin = ref(15);
const selectedPage = ref(null);
const filterLevel = ref(null); // null | 'warn' | 'crit'
const openFlowLabels = ref([]);
const labelFilterFlow = ref([]);
const labelFilterCabang = ref([]);
const labelFilterInformation = ref([]);
const labelFilterHandleBy = ref([]);
const labelGroups = ref([]);
const informationLabels = ref([]);
const unassigned = ref([]);
const labelPageOptions = ref([]);
const unassignedOpen = ref(false);
const labelReorderSaving = ref(false);
const labelReorderError = ref("");
const historyOpen = ref({});
const historyData = ref({});

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

/* ── Tag Trigger (auto-tag rules) state ── */
const rules = ref([]);
const ruleLabels = ref([]);
const loadingRules = ref(false);
const rulesError = ref("");
const ruleFormVisible = ref(false);
const ruleFormMode = ref("create");
const ruleFormLoading = ref(false);
const ruleFormErrors = ref({});
const editingRuleId = ref(null);
const containsAnyText = ref("");
const notContainsAnyText = ref("");

const defaultRuleForm = () => ({
  wa_monitor_label_id: null,
  trigger_text: "",
  source_chat: "any",
  match_scope: "latest_any",
  sort_order: 0,
  enabled: true,
  condition_note: "",
});
const ruleForm = ref(defaultRuleForm());

/* ── Helpers ── */
function sourceChatToMatchScope(sourceChat) {
  if (sourceChat === "customer") return "latest_customer";
  if (sourceChat === "admin") return "latest_outbound";
  return "latest_any";
}

function matchScopeToSourceChat(matchScope) {
  if (matchScope === "latest_customer") return "customer";
  if (matchScope === "latest_outbound") return "admin";
  return "any";
}

function ruleSourceChat(rule) {
  if (rule?.source_chat && rule.source_chat !== "any") return rule.source_chat;
  return matchScopeToSourceChat(rule?.match_scope);
}

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
  if (sinceMs === null || sinceMs === undefined) return '-';
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
  [...conversations.value].sort((a, b) => {
    const aSince = a.unread_since ?? Infinity;
    const bSince = b.unread_since ?? Infinity;
    return aSince - bSince;
  }),
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

const unreadCount = computed(() =>
  conversations.value.filter((c) => c.unread_since !== null).length,
);

const warnCount = computed(
  () =>
    conversations.value.filter((c) => c.unread_since !== null && getLevel(c.unread_since) === "warn")
      .length,
);
const critCount = computed(
  () =>
    conversations.value.filter((c) => c.unread_since !== null && getLevel(c.unread_since) === "crit")
      .length,
);

const tagNameById = computed(() => {
  const map = {};
  labelGroups.value.forEach((group) => {
    (group.labels ?? []).forEach((label) => {
      if (label.pancake_tag_id !== undefined && label.name) {
        map[String(label.pancake_tag_id)] = label.name;
      }
    });
  });
  informationLabels.value.forEach((label) => {
    if (label.pancake_tag_id !== undefined && label.name) {
      map[String(label.pancake_tag_id)] = label.name;
    }
  });
  unassigned.value.forEach((label) => {
    if (label.pancake_tag_id !== undefined && label.name) {
      map[String(label.pancake_tag_id)] = label.name;
    }
  });
  collectTagObjects(tagDebug.value).forEach((tag) => {
    const id = tag.pancake_tag_id ?? tag.tag_id ?? tag.tagId ?? tag.id;
    const name = tag.name ?? tag.title ?? tag.text ?? tag.label ?? tag.tag_name;
    if (id !== undefined && name && !map[String(id)]) map[String(id)] = name;
  });
  return map;
});

function getLabelItems(label) {
  if (!labelMatchesFlowFilter(label)) return [];
  return labelRows.value[label.name]?.items ?? [];
}

function getLabelCount(label) {
  if (!labelMatchesFlowFilter(label)) return 0;
  return label.count ?? getLabelItems(label).length;
}

function getLabelCountText(label) {
  if (!labelMatchesFlowFilter(label)) return "0 chat";
  const total = getLabelCount(label);
  return `${total} chat`;
}

function getSectionTotal(section) {
  return (section.labels ?? []).reduce((sum, label) => sum + getLabelCount(label), 0);
}

function labelMatchesFlowFilter(label) {
  return !labelFilterFlow.value.length || labelFilterFlow.value.includes(label.name);
}

function getLabelState(labelName) {
  return labelRows.value[labelName] ?? {
    items: [],
    loading: false,
    error: "",
    loaded: false,
    hasMore: false,
  };
}

function setLabelState(labelName, patch) {
  labelRows.value = {
    ...labelRows.value,
    [labelName]: {
      ...getLabelState(labelName),
      ...patch,
    },
  };
}

function isLabelLoading(labelName) {
  return getLabelState(labelName).loading;
}

function getLabelError(labelName) {
  return getLabelState(labelName).error;
}

function hasMoreLabelRows(label) {
  return labelMatchesFlowFilter(label) && getLabelState(label.name).hasMore;
}

function allFlowLabels() {
  return [
    ...labelGroups.value.flatMap((group) => group.labels ?? []),
    ...unassigned.value,
  ];
}

function findFlowLabel(labelName) {
  return allFlowLabels().find((label) => label.name === labelName);
}

function labelFilterParams() {
  const params = {};
  if (labelFilterHandleBy.value.length) params.handle_by = labelFilterHandleBy.value.join(",");
  if (labelFilterCabang.value.length) params.page_name = labelFilterCabang.value.join(",");
  if (labelFilterInformation.value.length) params.information_label = labelFilterInformation.value.join(",");
  return params;
}

async function fetchLabelRows(label, append = false) {
  if (!label?.name || !labelMatchesFlowFilter(label)) return;

  const state = getLabelState(label.name);
  if (state.loading) return;

  const offset = append ? state.items.length : 0;
  setLabelState(label.name, { loading: true, error: "" });

  try {
    const { data } = await axios.get(`${API_BASE}/wa-monitor/label-conversations`, {
      params: {
        label: label.name,
        limit: 50,
        offset,
        ...labelFilterParams(),
      },
    });
    const rows = data.data ?? [];
    const items = append ? [...state.items, ...rows] : rows;
    setLabelState(label.name, {
      items,
      loading: false,
      error: "",
      loaded: true,
      hasMore: Boolean(data.meta?.has_more),
    });
    pageErrors.value = data.errors ?? [];
  } catch (err) {
    setLabelState(label.name, {
      loading: false,
      error: err.response?.data?.error ?? err.message ?? "Gagal mengambil chat label.",
    });
  }
}

async function reloadOpenLabels() {
  const labels = openFlowLabels.value
    .map((labelName) => findFlowLabel(labelName))
    .filter(Boolean);

  await Promise.all(labels.map((label) => fetchLabelRows(label)));
}

const labelFlowTotal = computed(() =>
  labelGroups.value.reduce((sum, section) => sum + getSectionTotal(section), 0),
);

const flowFilterOptions = computed(() =>
  labelGroups.value.flatMap((group) => (group.labels ?? []).map((label) => label.name)),
);

const informationFilterOptions = computed(() => {
  const labels = new Set();
  sorted.value.forEach((conversation) => {
    getInformationLabels(conversation).forEach((label) => labels.add(label));
  });
  Object.values(labelRows.value).forEach((state) => {
    (state.items ?? []).forEach((conversation) => {
      getInformationLabels(conversation).forEach((label) => labels.add(label));
    });
  });
  informationLabels.value.forEach((label) => labels.add(label.name));
  return [...labels].sort((a, b) => a.localeCompare(b));
});

const handleByFilterOptions = computed(() => {
  const names = new Set();
  sorted.value.forEach((conversation) => {
    getHandleBy(conversation).forEach((name) => names.add(name));
  });
  Object.values(labelRows.value).forEach((state) => {
    (state.items ?? []).forEach((conversation) => {
      getHandleBy(conversation).forEach((name) => names.add(name));
    });
  });
  return [...names].sort((a, b) => a.localeCompare(b));
});

const cabangFilterOptions = computed(() => {
  if (waPages.value.length) {
    return waPages.value
      .filter((page) => page.is_active)
      .map((page) => page.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }

  if (labelPageOptions.value.length) {
    return [...labelPageOptions.value].sort((a, b) => a.localeCompare(b));
  }

  const pages = new Set();
  sorted.value.forEach((conversation) => {
    if (conversation.page_name) pages.add(conversation.page_name);
  });
  return [...pages].sort((a, b) => a.localeCompare(b));
});

function collectTagObjects(value, result = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectTagObjects(item, result));
    return result;
  }

  if (!value || typeof value !== "object") return result;

  const hasTagShape =
    (value.pancake_tag_id !== undefined ||
      value.id !== undefined ||
      value.tag_id !== undefined ||
      value.tagId !== undefined) &&
    (value.name || value.title || value.text || value.label || value.tag_name);

  if (hasTagShape) result.push(value);

  Object.values(value).forEach((item) => collectTagObjects(item, result));
  return result;
}

function getConversationTagIds(conversation) {
  const tags = conversation.tags ?? [];
  return Array.isArray(tags) ? tags.map((tag) => String(tag)) : [];
}

function getTagLabel(tag) {
  return tagNameById.value[String(tag)] ?? `Tag ${tag}`;
}

function getConversationLabels(conversation) {
  const names = new Set();
  (conversation.labels ?? []).forEach((label) => {
    if (label.name) names.add(String(label.name));
  });
  const tagNames = conversation.tag_names ?? conversation.tagNames ?? {};
  if (tagNames && typeof tagNames === "object" && !Array.isArray(tagNames)) {
    Object.values(tagNames).forEach((name) => {
      if (name) names.add(String(name));
    });
  }
  getConversationTagIds(conversation).forEach((tag) => names.add(getTagLabel(tag)));
  return [...names];
}

function getInformationLabels(conversation) {
  return getConversationLabels(conversation).filter((label) =>
    informationLabels.value.some((item) => item.name === label),
  );
}

function getLabelDurationSince(conversation, label) {
  const durations = conversation.label_durations ?? conversation.labelDurations ?? [];
  if (!Array.isArray(durations)) return null;
  const tagId = typeof label === "object" ? label.pancake_tag_id : label;
  const labelName = typeof label === "object" ? label.name : null;
  const duration = durations.find(
    (item) =>
      String(item.pancake_tag_id) === String(tagId) ||
      (labelName && item.name === labelName),
  );
  return duration?.since ?? null;
}

function getTotalFlow(conversation) {
  return conversation.total_flow_ms ?? null;
}

function getHandleBy(conversation) {
  const value = conversation.handle_by ?? conversation.handleBy ?? [];
  if (Array.isArray(value)) return value.filter(Boolean).map((name) => String(name));
  if (value) return [String(value)];
  return [];
}

async function toggleHistory(conversationId) {
  if (historyOpen.value[conversationId]) {
    historyOpen.value = { ...historyOpen.value, [conversationId]: false };
    return;
  }
  historyOpen.value = { ...historyOpen.value, [conversationId]: true };
  if (historyData.value[conversationId]) return; // already loaded
  try {
    const { data } = await axios.get(`${API_BASE}/wa-monitor/history`, {
      params: { conversation_id: conversationId },
    });
    historyData.value = { ...historyData.value, [conversationId]: data };
  } catch {
    historyData.value = { ...historyData.value, [conversationId]: null };
  }
}

function formatDurationMs(ms) {
  if (!ms) return "—";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}

function isFlowGroupOpen(label) {
  return openFlowLabels.value.includes(label);
}

function openAllFlowGroups() {
  openFlowLabels.value = [
    ...labelGroups.value.flatMap((group) =>
      (group.labels ?? []).map((label) => label.name),
    ),
    ...unassigned.value.map((label) => label.name),
  ];
  allFlowLabels()
    .filter((label) => labelMatchesFlowFilter(label))
    .forEach((label) => fetchLabelRows(label));
}

function closeAllFlowGroups() {
  openFlowLabels.value = [];
}

function toggleFlowGroup(label) {
  const wasOpen = isFlowGroupOpen(label);
  openFlowLabels.value = wasOpen
    ? openFlowLabels.value.filter((item) => item !== label)
    : [...openFlowLabels.value, label];

  if (!wasOpen) {
    const item = findFlowLabel(label);
    if (item) fetchLabelRows(item);
  }
}

function getLabelColorKey(label) {
  return typeof label === "object" ? label.color : null;
}

function getLabelCardClass(label) {
  const classes = {
    indigo: "border-indigo-100 bg-indigo-50",
    emerald: "border-emerald-100 bg-emerald-50",
    violet: "border-violet-100 bg-violet-50",
    amber: "border-amber-100 bg-amber-50",
    yellow: "border-yellow-100 bg-yellow-50",
    orange: "border-orange-100 bg-orange-50",
    green: "border-green-100 bg-green-50",
    cyan: "border-cyan-100 bg-cyan-50",
    lime: "border-lime-100 bg-lime-50",
    teal: "border-teal-100 bg-teal-50",
  };

  return classes[getLabelColorKey(label)] || "border-gray-100 bg-white";
}

function getLabelDotClass(label) {
  const classes = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    green: "bg-green-500",
    cyan: "bg-cyan-500",
    lime: "bg-lime-500",
    teal: "bg-teal-500",
  };

  return classes[getLabelColorKey(label)] || "bg-gray-400";
}

function getLabelAvatarClass(label) {
  const classes = {
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    green: "border-green-200 bg-green-50 text-green-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    lime: "border-lime-200 bg-lime-50 text-lime-700",
    teal: "border-teal-200 bg-teal-50 text-teal-700",
  };

  return classes[getLabelColorKey(label)] || "border-gray-200 bg-white text-gray-600";
}

async function fetchPancakeTags() {
  loadingTags.value = true;
  tagErrors.value = [];
  try {
    const { data } = await axios.get(`${API_BASE}/wa-monitor/tags`);
    tagDebug.value = data.tags ?? data.data ?? [];
    tagErrors.value = data.errors ?? [];
  } catch (err) {
    tagErrors.value = [
      err.response?.data?.error ?? err.message ?? "Gagal mengambil tag dictionary.",
    ];
  } finally {
    loadingTags.value = false;
  }
}

async function fetchLabelConfig() {
  loadingLabeled.value = true;
  labeledError.value = "";
  try {
    const { data } = await axios.get(`${API_BASE}/wa-monitor/label-summary`, {
      params: labelFilterParams(),
    });
    labelGroups.value = data.groups ?? [];
    informationLabels.value = data.information_labels ?? [];
    unassigned.value = data.unassigned ?? [];
    labelPageOptions.value = data.page_names ?? [];
    totalIndexed.value = data.total_indexed ?? 0;
    lastSync.value = data.last_sync
      ? new Date(data.last_sync).toLocaleTimeString("id-ID")
      : "-";
  } catch (err) {
    labeledError.value =
      err.response?.data?.error ?? err.message ?? "Gagal mengambil label monitor.";
  } finally {
    loadingLabeled.value = false;
  }
}

async function refreshLabeled() {
  labelRows.value = {};
  historyOpen.value = {};
  historyData.value = {};
  await fetchLabelConfig();
  await reloadOpenLabels();
}

async function saveLabelReorder() {
  labelReorderSaving.value = true;
  labelReorderError.value = "";
  try {
    const groups = labelGroups.value.map((group) => ({
      id: group.id,
      labels: (group.labels ?? []).map((label, i) => ({
        id: label.id,
        sort_order: i,
      })),
    }));
    const infoLabels = informationLabels.value.map((label, i) => ({
      id: label.id,
      sort_order: i,
    }));
    const unassignedPayload = unassigned.value.map((label, i) => ({
      id: label.id,
      sort_order: i,
    }));
    await axios.post(`${API_BASE}/wa-monitor/labels/reorder`, {
      groups,
      information_labels: infoLabels,
      unassigned: unassignedPayload,
    });
    await fetchLabelConfig();
  } catch (err) {
    const msg = err.response?.data?.message
      ?? err.response?.data?.error
      ?? err.message
      ?? "Gagal menyimpan urutan.";
    const validationErrors = err.response?.data?.errors;
    labelReorderError.value = validationErrors
      ? Object.values(validationErrors).flat().join(" | ")
      : msg;
  } finally {
    labelReorderSaving.value = false;
  }
}

/* ── Tick live timer ── */
function startTick() {
  tickTimer = setInterval(() => {
    conversations.value = [...conversations.value];
  }, 60000);
}

/* ── Countdown ── */
function startCountdown() {
  countdownSec.value = refreshInterval.value;
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    if (activeTab.value !== "monitor") return;
    countdownSec.value--;
    if (countdownSec.value <= 0) {
      countdownSec.value = refreshInterval.value;
      fetchConversations();
    }
  }, 1000);
}

/* ── Fetch conversations ── */
async function fetchConversations() {
  if (activeTab.value !== "monitor") return;
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
  if (activeTab.value === "monitor") fetchConversations();
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
    if (activeTab.value === "monitor") fetchConversations();
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
    if (activeTab.value === "monitor") fetchConversations();
  } catch {
    alert("Gagal menghapus.");
  }
}

/* ── Tag Trigger (auto-tag rules) ── */
async function fetchAutoTagRules() {
  if (!isSuperadmin.value) return;
  loadingRules.value = true;
  rulesError.value = "";
  try {
    const { data } = await axios.get(`${API_BASE}/wa-monitor/auto-tag-rules`);
    rules.value = data.rules ?? [];
    ruleLabels.value = data.labels ?? [];
  } catch (err) {
    rulesError.value =
      err.response?.data?.error ?? err.message ?? "Gagal mengambil rule.";
  } finally {
    loadingRules.value = false;
  }
}

function linesToList(text) {
  return (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

function openRuleForm(rule = null) {
  ruleFormErrors.value = {};
  if (rule) {
    ruleFormMode.value = "edit";
    editingRuleId.value = rule.id;
    ruleForm.value = {
      wa_monitor_label_id: rule.wa_monitor_label_id ?? null,
      trigger_text: rule.trigger_text ?? "",
      source_chat: ruleSourceChat(rule),
      match_scope: sourceChatToMatchScope(ruleSourceChat(rule)),
      sort_order: rule.sort_order ?? 0,
      enabled: rule.enabled ?? true,
      condition_note: rule.condition_note ?? "",
    };
    containsAnyText.value = (rule.contains_any ?? []).join("\n");
    notContainsAnyText.value = (rule.not_contains_any ?? []).join("\n");
  } else {
    ruleFormMode.value = "create";
    editingRuleId.value = null;
    ruleForm.value = defaultRuleForm();
    containsAnyText.value = "";
    notContainsAnyText.value = "";
  }
  ruleFormVisible.value = true;
}

async function submitRuleForm() {
  ruleFormErrors.value = {};
  ruleFormLoading.value = true;
  try {
    const payload = {
      ...ruleForm.value,
      match_scope: sourceChatToMatchScope(ruleForm.value.source_chat),
      trigger_text: ruleForm.value.trigger_text?.trim() || null,
      condition_note: ruleForm.value.condition_note?.trim() || null,
      contains_any: linesToList(containsAnyText.value),
      not_contains_any: linesToList(notContainsAnyText.value),
    };
    if (ruleFormMode.value === "create") {
      await axios.post(`${API_BASE}/wa-monitor/auto-tag-rules`, payload);
    } else {
      await axios.put(
        `${API_BASE}/wa-monitor/auto-tag-rules/${editingRuleId.value}`,
        payload,
      );
    }
    ruleFormVisible.value = false;
    fetchAutoTagRules();
  } catch (err) {
    if (err.response?.status === 422) {
      const errs = err.response.data.errors ?? {};
      ruleFormErrors.value = Object.fromEntries(
        Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
      );
    } else {
      rulesError.value =
        err.response?.data?.error ?? err.message ?? "Gagal menyimpan rule.";
    }
  } finally {
    ruleFormLoading.value = false;
  }
}

async function deleteRule(rule) {
  if (!confirm(`Hapus rule untuk tag "${rule.label ?? rule.pancake_tag_id}"?`)) return;
  try {
    await axios.delete(`${API_BASE}/wa-monitor/auto-tag-rules/${rule.id}`);
    fetchAutoTagRules();
  } catch {
    alert("Gagal menghapus rule.");
  }
}

watch(
  [labelFilterFlow, labelFilterCabang, labelFilterInformation, labelFilterHandleBy],
  () => {
    if (activeTab.value !== "labels") return;
    fetchLabelConfig();
    reloadOpenLabels();
  },
  { deep: true },
);

watch(activeTab, (tab) => {
  if (tab === "monitor") {
    fetchConversations();
    startCountdown();
    return;
  }

  if (countdownTimer) clearInterval(countdownTimer);

  if (tab === "labels") {
    fetchLabelConfig();
    fetchPancakeTags();
    reloadOpenLabels();
  }

  if (tab === "pages") {
    fetchPages();
  }

  if (tab === "tag-trigger") {
    fetchAutoTagRules();
  }
});

/* ── Lifecycle ── */
onMounted(() => {
  fetchSettings();
  if (activeTab.value === "monitor") {
    fetchConversations();
  } else if (activeTab.value === "labels") {
    fetchLabelConfig();
    fetchPancakeTags();
  } else if (activeTab.value === "pages") {
    fetchPages();
  } else if (activeTab.value === "tag-trigger") {
    fetchAutoTagRules();
  }
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
