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
        <h2 class="text-xl text-center font-bold text-gray-900 mb-4">
          CHANNEL ONLINE
        </h2>
        <div class="grid grid-cols-5 gap-3">
          <button
            v-for="channel in channelsOnline"
            :key="channel.name"
            @click="openOnlineModal(channel.name)"
            :class="[
              'py-3 px-1 border-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              formData.channelOnline === channel.name
                ? channel.activeBg +
                  ' ' +
                  channel.activeText +
                  ' ' +
                  channel.activeBorder
                : channel.inactiveBg +
                  ' ' +
                  channel.inactiveText +
                  ' ' +
                  channel.inactiveBorder +
                  ' ' +
                  channel.hover,
            ]"
          >
            <component :is="channel.icon" class="w-5 h-5 flex-shrink-0" />
            <span>{{ channel.name }}</span>
          </button>
        </div>
      </div>

      <!-- Channel Offline Section -->
      <div class="mb-8">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Channel Offline</h2>
        </div>

        <div class="flex justify-center">
          <button
            @click="openOfflineModal"
            :class="[
              'group relative py-4 px-10 rounded-lg font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-xl',
              formData.channelOffline === 'OUTLET'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500 hover:scale-105',
            ]"
          >
            <span class="relative z-10 flex items-center gap-2">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              OUTLET
            </span>

            <!-- Decorative gradient overlay for active state -->
            <div
              v-if="formData.channelOffline === 'OUTLET'"
              class="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-lg"
            ></div>
          </button>
        </div>

        <!-- Optional: Info badge when selected -->
        <div
          v-if="formData.channelOffline === 'OUTLET'"
          class="mt-4 text-center"
        >
          <span
            class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
            Channel dipilih
          </span>
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
            <TransitionGroup name="list" tag="tbody">
              <tr
                v-for="lead in leadsList"
                :key="lead.id"
                class="lead-item hover:bg-gray-50 border-b"
                :data-optimistic="lead._optimistic"
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
              <tr v-if="leadsList.length === 0" key="empty">
                <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                  Belum ada data leads
                </td>
              </tr>
            </TransitionGroup>
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
    <!-- Toast Notification (Center Screen - SweetAlert Style) -->
    <TransitionRoot :show="notification.show" as="template">
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
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

        <!-- Notification Card -->
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
                <!-- Icon -->
                <div
                  class="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4"
                  :class="
                    notification.type === 'error'
                      ? 'bg-red-100'
                      : 'bg-green-100'
                  "
                >
                  <!-- Success Icon -->
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
                  <!-- Error Icon -->
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

                <!-- Title -->
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

                <!-- Message -->
                <p class="text-sm text-gray-600">
                  {{ notification.message }}
                </p>
              </div>
            </div>
          </div>
        </TransitionChild>
      </div>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import axios from "axios";
import { h } from "vue";
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

// Icon Components
const FacebookIcon = (props) =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      ...props,
    },
    [
      h("path", {
        d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
      }),
    ]
  );

const WebsiteIcon = (props) =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      ...props,
    },
    [
      h("circle", { cx: "12", cy: "12", r: "10" }),
      h("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
      h("path", {
        d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
      }),
    ]
  );

const InstagramIcon = (props) =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      ...props,
    },
    [
      h("path", {
        d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      }),
    ]
  );

const WhatsAppIcon = (props) =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "currentColor",
      ...props,
    },
    [
      h("path", {
        d: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
      }),
    ]
  );

const OrganicIcon = (props) =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      ...props,
    },
    [
      h("path", {
        d: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
      }),
      h("polyline", { points: "3.27 6.96 12 12.01 20.73 6.96" }),
      h("line", { x1: "12", y1: "22.08", x2: "12", y2: "12" }),
    ]
  );

// Channels
const channelsOnline = [
  {
    name: "Facebook",
    icon: FacebookIcon,
    activeBg: "bg-[#1877F2]",
    activeText: "text-white",
    activeBorder: "border-[#1877F2]",
    inactiveBg: "bg-white",
    inactiveText: "text-[#1877F2]",
    inactiveBorder: "border-[#1877F2]",
    hover: "hover:bg-[#1877F2]/10",
  },
  {
    name: "Website",
    icon: WebsiteIcon,
    activeBg: "bg-[#4F46E5]",
    activeText: "text-white",
    activeBorder: "border-[#4F46E5]",
    inactiveBg: "bg-white",
    inactiveText: "text-[#4F46E5]",
    inactiveBorder: "border-[#4F46E5]",
    hover: "hover:bg-[#4F46E5]/10",
  },
  {
    name: "Instagram",
    icon: InstagramIcon,
    activeBg: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    activeText: "text-white",
    activeBorder: "border-[#E1306C]",
    inactiveBg: "bg-white",
    inactiveText: "text-[#E1306C]",
    inactiveBorder: "border-[#E1306C]",
    hover:
      "hover:bg-gradient-to-br hover:from-[#833AB4]/10 hover:via-[#FD1D1D]/10 hover:to-[#F77737]/10",
  },
  {
    name: "CTWA",
    icon: WhatsAppIcon,
    activeBg: "bg-[#25D366]",
    activeText: "text-white",
    activeBorder: "border-[#25D366]",
    inactiveBg: "bg-white",
    inactiveText: "text-[#25D366]",
    inactiveBorder: "border-[#25D366]",
    hover: "hover:bg-[#25D366]/10",
  },
  {
    name: "ORGANIK",
    icon: OrganicIcon,
    activeBg: "bg-[#10B981]",
    activeText: "text-white",
    activeBorder: "border-[#10B981]",
    inactiveBg: "bg-white",
    inactiveText: "text-[#10B981]",
    inactiveBorder: "border-[#10B981]",
    hover: "hover:bg-[#10B981]/10",
  },
];

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
// Validate Form
const validateOnlineForm = () => {
  clearErrors();
  let isValid = true;

  if (!modalData.nomor_leads) {
    errors.nomor_leads = "No Leads harus diisi!";
    isValid = false;
  } else {
    // Normalize format: support +62, 62, atau 08
    let normalized = modalData.nomor_leads.trim();

    // Hapus spasi, dash, atau karakter non-digit kecuali +
    normalized = normalized.replace(/[\s\-\(\)]/g, "");

    // Validasi format
    const isValidFormat = /^(\+?62|0)8\d{8,12}$/.test(normalized);

    if (!isValidFormat) {
      errors.nomor_leads =
        "Format No Leads tidak valid (contoh: 08123456789 atau +6281234567890)";
      isValid = false;
    } else {
      // Normalisasi ke format 08xxx
      if (normalized.startsWith("+62")) {
        normalized = "0" + normalized.slice(3);
      } else if (normalized.startsWith("62")) {
        normalized = "0" + normalized.slice(2);
      }

      // Update dengan format yang sudah dinormalisasi
      modalData.nomor_leads = normalized;
    }
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
  } else {
    // Normalize format: support +62, 62, atau 08
    let normalized = modalData.nomor_leads.trim();

    // Hapus spasi, dash, atau karakter non-digit kecuali +
    normalized = normalized.replace(/[\s\-\(\)]/g, "");

    // Validasi format
    const isValidFormat = /^(\+?62|0)8\d{8,12}$/.test(normalized);

    if (!isValidFormat) {
      errors.nomor_leads =
        "Format No Leads tidak valid (contoh: 08123456789 atau +6281234567890)";
      isValid = false;
    } else {
      // Normalisasi ke format 08xxx
      if (normalized.startsWith("+62")) {
        normalized = "0" + normalized.slice(3);
      } else if (normalized.startsWith("62")) {
        normalized = "0" + normalized.slice(2);
      }

      // Update dengan format yang sudah dinormalisasi
      modalData.nomor_leads = normalized;
    }
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

// Add notification state
const notification = reactive({
  show: false,
  type: "success", // 'success' | 'error'
  message: "",
});

// Show notification function
const showNotification = (type, message) => {
  notification.type = type;
  notification.message = message;
  notification.show = true;

  // Auto hide after 4 seconds
  setTimeout(() => {
    notification.show = false;
  }, 3000);
};

const saveToAPI = async () => {
  const now = new Date();

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

  // ⏳ Delay 500ms sebelum tampil di list (smooth, tidak berkedip)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 🔹 Langsung tampil
  leadsList.value.unshift(tempLead);

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

      showNotification("success", "Data leads berhasil disimpan!");
    }
  } catch (error) {
    console.error(error);

    // Rollback
    leadsList.value = leadsList.value.filter((l) => l.id !== tempLead.id);

    let errorMessage = "Gagal menyimpan data";

    if (error.response?.status === 409) {
      errorMessage =
        error.response.data.message || "Nomor leads sudah ditangani";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.request) {
      errorMessage = "Tidak dapat terhubung ke server";
    }

    showNotification("error", errorMessage);
  }
};
</script>

<style scoped>
.lead-item {
  transition: all 0.2s ease;
}

/* Fade out saat dihapus */
.v-leave-active {
  transition: all 0.2s ease;
}

.v-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
