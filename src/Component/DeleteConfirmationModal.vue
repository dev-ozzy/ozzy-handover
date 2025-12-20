<!-- src/components/DeleteConfirmationModal.vue -->
<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="handleCancel">
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

      <!-- Modal Container -->
      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
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
              class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div class="sm:flex sm:items-start">
                  <!-- Warning Icon -->
                  <div
                    class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
                  >
                    <svg
                      class="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>

                  <!-- Content -->
                  <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle
                      as="h3"
                      class="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Hapus Data Leads
                    </DialogTitle>
                    <div class="mt-3">
                      <p class="text-sm text-gray-500 mb-3">
                        Apakah Anda yakin ingin menghapus data leads ini?
                        Tindakan ini tidak dapat dibatalkan.
                      </p>

                      <!-- Lead Details Card -->
                      <div
                        v-if="lead"
                        class="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div class="space-y-2 text-sm">
                          <div class="flex justify-between">
                            <span class="font-medium text-gray-700"
                              >Nomor Leads:</span
                            >
                            <span class="text-gray-900 font-semibold">{{
                              lead.nomor_leads
                            }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="font-medium text-gray-700"
                              >Deal Maker:</span
                            >
                            <span class="text-gray-900">{{
                              lead.deal_maker?.name || "-"
                            }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="font-medium text-gray-700"
                              >Cabang:</span
                            >
                            <span class="text-gray-900">{{ lead.cabang }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="font-medium text-gray-700"
                              >Channel:</span
                            >
                            <span
                              :class="[
                                'px-2 py-0.5 rounded text-xs font-semibold',
                                getChannelClass(lead.channel),
                              ]"
                            >
                              {{ lead.channel }}
                            </span>
                          </div>
                          <div class="flex justify-between">
                            <span class="font-medium text-gray-700"
                              >Tanggal:</span
                            >
                            <span class="text-gray-900">{{
                              formatDate(lead.tanggal)
                            }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div
                class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3"
              >
                <button
                  @click="handleConfirm"
                  :disabled="isDeleting"
                  :class="[
                    'inline-flex w-full justify-center rounded-md px-6 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto transition-all',
                    isDeleting
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                  ]"
                >
                  <span v-if="isDeleting" class="flex items-center gap-2">
                    <svg
                      class="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Menghapus...
                  </span>
                  <span v-else>Ya, Hapus</span>
                </button>
                <button
                  @click="handleCancel"
                  :disabled="isDeleting"
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Batal
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
    default: false,
  },
  lead: {
    type: Object,
    default: null,
  },
  isDeleting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const handleConfirm = () => {
  if (!props.isDeleting) {
    emit("confirm");
  }
};

const handleCancel = () => {
  if (!props.isDeleting) {
    emit("cancel");
  }
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
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
