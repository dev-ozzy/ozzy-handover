<!-- src/Component/MultiSelect.vue -->
<template>
  <div class="relative" ref="dropdownRef">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>

    <!-- Selected Items Display / Trigger -->
    <div
      @click="toggleDropdown"
      class="w-full min-h-[42px] px-4 py-2 border border-gray-300 rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white hover:border-gray-400 transition-colors"
    >
      <div class="flex flex-wrap gap-2 items-center">
        <!-- Selected Tags -->
        <span
          v-for="item in selectedItems"
          :key="item"
          class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium"
        >
          {{ getDisplayValue(item) }}
          <button
            @click.stop="removeItem(item)"
            class="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
          >
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </span>

        <!-- Placeholder or count -->
        <span v-if="selectedItems.length === 0" class="text-gray-500 text-sm">
          {{ placeholder }}
        </span>

        <!-- Chevron Icon -->
        <svg
          class="w-5 h-5 text-gray-400 ml-auto"
          :class="{ 'rotate-180': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-show="isOpen"
        class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
      >
        <!-- Search Box (Optional) -->
        <div
          v-if="searchable"
          class="p-2 border-b border-gray-200 sticky top-0 bg-white"
        >
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            @click.stop
          />
        </div>

        <!-- Select All Option -->
        <div
          v-if="showSelectAll"
          class="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-200 flex items-center gap-2"
          @click="toggleSelectAll"
        >
          <input
            type="checkbox"
            :checked="isAllSelected"
            class="rounded text-blue-600 focus:ring-blue-500"
            @click.stop="toggleSelectAll"
          />
          <span class="text-sm font-medium text-gray-700">Pilih Semua</span>
        </div>

        <!-- Options List -->
        <div
          v-for="option in filteredOptions"
          :key="valueKey ? option[valueKey] : option"
          class="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors"
          @click="toggleItem(valueKey ? option[valueKey] : option)"
        >
          <input
            type="checkbox"
            :checked="isSelected(valueKey ? option[valueKey] : option)"
            class="rounded text-blue-600 focus:ring-blue-500"
            @click.stop="toggleItem(valueKey ? option[valueKey] : option)"
          />
          <span class="text-sm text-gray-700">
            {{ displayKey ? option[displayKey] : option }}
          </span>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredOptions.length === 0"
          class="px-4 py-3 text-sm text-gray-500 text-center"
        >
          Tidak ada data
        </div>
      </div>
    </Transition>

    <!-- Clear All Button -->
    <button
      v-if="selectedItems.length > 0 && showClearButton"
      @click="clearAll"
      class="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
    >
      Clear All ({{ selectedItems.length }})
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Pilih opsi...",
  },
  valueKey: {
    type: String,
    default: null,
  },
  displayKey: {
    type: String,
    default: null,
  },
  searchable: {
    type: Boolean,
    default: true,
  },
  showSelectAll: {
    type: Boolean,
    default: true,
  },
  showClearButton: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const isOpen = ref(false);
const searchQuery = ref("");
const dropdownRef = ref(null);
const selectedItems = ref([...props.modelValue]);

// Computed
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;

  const query = searchQuery.value.toLowerCase();
  return props.options.filter((option) => {
    const displayValue = props.displayKey ? option[props.displayKey] : option;
    return displayValue.toLowerCase().includes(query);
  });
});

const isAllSelected = computed(() => {
  return (
    props.options.length > 0 &&
    selectedItems.value.length === props.options.length
  );
});

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    searchQuery.value = "";
  }
};

const closeDropdown = () => {
  isOpen.value = false;
};

const isSelected = (value) => {
  return selectedItems.value.includes(value);
};

const toggleItem = (value) => {
  const index = selectedItems.value.indexOf(value);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(value);
  }
  emitChange();
};

const removeItem = (value) => {
  const index = selectedItems.value.indexOf(value);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
    emitChange();
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = props.options.map((option) =>
      props.valueKey ? option[props.valueKey] : option
    );
  }
  emitChange();
};

const clearAll = () => {
  selectedItems.value = [];
  emitChange();
};

const getDisplayValue = (value) => {
  if (!props.displayKey) return value;
  const option = props.options.find(
    (opt) => (props.valueKey ? opt[props.valueKey] : opt) === value
  );
  return option ? option[props.displayKey] : value;
};

const emitChange = () => {
  emit("update:modelValue", selectedItems.value);
  emit("change", selectedItems.value);
};

// Handle click outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown();
  }
};

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedItems.value = [...newValue];
  },
  { deep: true }
);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

/* Custom scrollbar */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
