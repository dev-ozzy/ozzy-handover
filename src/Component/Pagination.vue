<!-- src/components/Pagination.vue -->
<template>
  <div class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Info Text -->
      <div class="text-sm text-gray-700">
        Menampilkan
        <span class="font-medium">{{ from }}</span>
        sampai
        <span class="font-medium">{{ to }}</span>
        dari
        <span class="font-medium">{{ totalItems }}</span>
        hasil
      </div>

      <!-- Pagination Buttons -->
      <div class="flex items-center gap-2">
        <!-- First Page Button -->
        <button
          @click="goToPage(1)"
          :disabled="currentPage === 1"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-all',
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
          ]"
          title="Halaman Pertama"
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
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- Previous Button -->
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-all',
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
          ]"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- Page Numbers -->
        <div class="hidden sm:flex items-center gap-1">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="page !== '...' && goToPage(page)"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-lg transition-all',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : page === '...'
                ? 'bg-white text-gray-400 cursor-default'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
            ]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>

        <!-- Mobile Page Info -->
        <div class="sm:hidden px-3 py-2 text-sm font-medium text-gray-700">
          {{ currentPage }} / {{ totalPages }}
        </div>

        <!-- Next Button -->
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-all',
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
          ]"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <!-- Last Page Button -->
        <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg transition-all',
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
          ]"
          title="Halaman Terakhir"
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
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    default: 1,
  },
  totalPages: {
    type: Number,
    required: true,
    default: 1,
  },
  totalItems: {
    type: Number,
    required: true,
    default: 0,
  },
  perPage: {
    type: Number,
    default: 10,
  },
  from: {
    type: Number,
    default: 0,
  },
  to: {
    type: Number,
    default: 0,
  },
  maxVisiblePages: {
    type: Number,
    default: 5,
  },
});

const emit = defineEmits(["page-change"]);

// Computed untuk visible pages dengan ellipsis
const visiblePages = computed(() => {
  const pages = [];
  const { currentPage, totalPages, maxVisiblePages } = props;

  if (totalPages <= maxVisiblePages) {
    // Jika total pages <= max visible, tampilkan semua
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Logika untuk menampilkan pages dengan ellipsis
    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Tampilkan: 1 2 3 4 ... last
      for (let i = 1; i <= 3; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      // Tampilkan: 1 ... n-2 n-1 n
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      // Tampilkan: 1 ... current-1 current current+1 ... last
      pages.push(1);
      pages.push("...");
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pages.push(i);
      }
      pages.push("...");
      pages.push(totalPages);
    } else {
      // Edge case: tampilkan semua
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    }
  }

  return pages;
});

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit("page-change", page);
  }
};
</script>

<style scoped>
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
