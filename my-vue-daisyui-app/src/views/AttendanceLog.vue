<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { apiService } from '../services/api';

const router = useRouter();
const { state: authState } = useAuthStore();

const isLoading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const selectedType = ref('am_in');

const attendanceTypes = [
  { value: 'am_in', label: 'AM In' },
  { value: 'am_out', label: 'AM Out' },
  { value: 'pm_in', label: 'PM In' },
  { value: 'pm_out', label: 'PM Out' },
];

const logAttendance = async () => {
  try {
    if (!authState.token) {
      router.push('/login');
      return;
    }

    isLoading.value = true;
    error.value = null;
    success.value = null;

    await apiService.logAttendance(authState.token, selectedType.value);
    success.value = 'Attendance logged successfully!';
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to log attendance';
    console.error('Error logging attendance:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Component is ready, user will manually select and log attendance
});
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body text-center">
        <div v-if="isLoading" class="space-y-4">
          <span class="loading loading-spinner loading-lg"></span>
          <h2 class="text-xl font-semibold">Logging Attendance...</h2>
          <p class="text-gray-600">Please wait while we record your attendance.</p>
        </div>

        <div v-else-if="error" class="space-y-4">
          <div class="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
          </div>
          <button @click="logAttendance" class="btn btn-primary">
            Try Again
          </button>
          <button @click="router.push('/dashboard')" class="btn btn-ghost">
            Back to Dashboard
          </button>
        </div>

        <div v-else-if="success" class="space-y-4">
          <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ success }}</span>
          </div>
          <p class="text-gray-600">Redirecting to dashboard...</p>
        </div>

        <div v-else class="space-y-4">
          <h2 class="text-2xl font-bold">Log Attendance</h2>
          <p class="text-gray-600">Select the type of attendance you want to log for a student.</p>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Attendance Type</span>
            </label>
            <select v-model="selectedType" class="select select-bordered w-full">
              <option 
                v-for="type in attendanceTypes" 
                :key="type.value" 
                :value="type.value"
              >
                {{ type.label }}
              </option>
            </select>
          </div>
          
          <button @click="logAttendance" class="btn btn-primary w-full">
            Log My Attendance
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 