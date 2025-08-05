<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Attendance Records</h2>
        <p class="text-sm text-gray-500">As of {{ currentDate }}</p>
      </div>
      <button 
        @click="$emit('close')"
        class="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
        aria-label="Close attendance viewer"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or course..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          v-model="dateFilter"
          type="date"
          class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredRecords.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No attendance records found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria</p>
    </div>

    <!-- Attendance Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortBy('attendee.full_name')">
              <div class="flex items-center">
                Name
                <SortIcon :direction="sortConfig.key === 'attendee.full_name' ? sortConfig.direction : null" />
              </div>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortBy('attendee.course')">
              <div class="flex items-center">
                Course
                <SortIcon :direction="sortConfig.key === 'attendee.course' ? sortConfig.direction : null" />
              </div>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" @click="sortBy('date')">
              <div class="flex items-center">
                Date
                <SortIcon :direction="sortConfig.key === 'date' ? sortConfig.direction : null" />
              </div>
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AM In</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AM Out</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PM In</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PM Out</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="record in filteredRecords" :key="record.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span class="text-blue-600 font-medium">{{ getInitials(record.attendee.full_name) }}</span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ record.attendee.full_name }}</div>
                  <div class="text-sm text-gray-500">{{ record.attendee.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ record.attendee.course }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(record.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="{'text-green-600 font-medium': record.am_in}">
                {{ record.am_in ? formatTime(record.am_in) : '-' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="{'text-green-600 font-medium': record.am_out}">
                {{ record.am_out ? formatTime(record.am_out) : '-' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="{'text-green-600 font-medium': record.pm_in}">
                {{ record.pm_in ? formatTime(record.pm_in) : '-' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="{'text-green-600 font-medium': record.pm_out}">
                {{ record.pm_out ? formatTime(record.pm_out) : '-' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="filteredRecords.length > 0" class="mt-6 flex items-center justify-between">
      <div class="text-sm text-gray-500">
        Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to 
        <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredRecords.length) }}</span> of 
        <span class="font-medium">{{ filteredRecords.length }}</span> results
      </div>
      <div class="flex space-x-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          @click="nextPage"
          :disabled="currentPage * itemsPerPage >= filteredRecords.length"
          class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import type { PropType } from 'vue';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';

// Sort Icon Component - Simplified to avoid DOM issues
const SortIcon = defineComponent({
  props: {
    direction: {
      type: String as PropType<string | null>,
      default: null
    }
  },
  setup(props) {
    return () => {
      const iconClass = 'ml-1 h-3 w-3';
      const pathProps = {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2'
      };

      let pathD = '';
      if (props.direction === 'asc') {
        pathD = 'M5 15l7-7 7 7';
      } else if (props.direction === 'desc') {
        pathD = 'M19 9l-7 7-7-7';
      } else {
        pathD = 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4';
      }

      return h('svg', {
        class: iconClass,
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      }, [
        h('path', {
          ...pathProps,
          d: pathD
        })
      ]);
    };
  }
});

const authStore = useAuthStore();
const attendanceRecords = ref<any[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');
const dateFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Sorting configuration
const sortConfig = ref({
  key: 'date',
  direction: 'desc'
});

// Current date for display
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Format time to HH:MM AM/PM
const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format date to MM/DD/YYYY
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

// Get initials from name
const getInitials = (name: string) => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase();
};

// Sort records
const sortBy = (key: string) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = 'asc';
  }
};

// Filter and sort records
const filteredRecords = computed(() => {
  let result = [...attendanceRecords.value];

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(record => 
      record.attendee.full_name.toLowerCase().includes(query) ||
      record.attendee.course.toLowerCase().includes(query)
    );
  }

  // Apply date filter
  if (dateFilter.value) {
    result = result.filter(record => record.date === dateFilter.value);
  }

  // Apply sorting
  if (sortConfig.value.key) {
    result.sort((a, b) => {
      const key = sortConfig.value.key;
      let aValue, bValue;

      if (key.includes('.')) {
        // Handle nested properties like 'attendee.full_name'
        const keys = key.split('.');
        aValue = keys.reduce((obj, k) => obj[k], a);
        bValue = keys.reduce((obj, k) => obj[k], b);
      } else {
        aValue = a[key];
        bValue = b[key];
      }

      if (aValue < bValue) {
        return sortConfig.value.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.value.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  return result;
});

// Pagination
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredRecords.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value * itemsPerPage < filteredRecords.value.length) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Fetch attendance records
const fetchAttendanceRecords = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    attendanceRecords.value = await apiService.getAttendanceRecords(authStore.state.token!);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    error.value = err instanceof Error ? err.message : 'An unknown error occurred';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAttendanceRecords();
});
</script>
