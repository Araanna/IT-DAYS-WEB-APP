<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { apiService } from '../services/api'
import type { User } from '../types/auth'

const route = useRoute()
const router = useRouter()
const { state: authState } = useAuthStore()

const attendee = ref<User | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const getYearLevelLabel = (user: User | null) => {
  if (!user) return 'N/A';
  
  // If API returns direct string (like /api/me response)
  if (typeof user.year_level === 'string') {
    return user.year_level;
  }
  
  // If API returns year_level object with label
  if (user.year_level && typeof user.year_level === 'object') {
    return user.year_level.label;
  }
  
  return 'N/A';
};

const fetchAttendee = async () => {
  try {
    if (!authState.token) {
      router.push('/login')
      return
    }
    
    isLoading.value = true
    error.value = null
    
    const attendeeId = Number(route.params.id)
    const data = await apiService.getAttendeeQr(authState.token, attendeeId)
    
    // Convert QR response to User format for display
    attendee.value = {
      id: attendeeId,
      full_name: data.full_name,
      email: data.email || '',
      course: data.course || '',
      year_level: data.year_level || '',
      qr_code_path: data.qr_code_path,
      qr_code_url: data.qr_code_url,
      has_attended: data.has_attended_today || false,
      role: 'Attendee',
      gender: 'Male' // Default value since not provided in QR response
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch attendee'
    console.error('Error fetching attendee:', err)
  } finally {
    isLoading.value = false
  }
}

const markAttendance = async () => {
  if (!attendee.value?.id) return
  
  try {
    await apiService.scanAttendee(authState.token!, attendee.value.id)

    if (attendee.value) {
      attendee.value.has_attended = true
    }
    
    alert('Attendance marked successfully!')
    router.push('/dashboard')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to mark attendance'
    console.error('Error marking attendance:', err)
  }
}

onMounted(() => {
  fetchAttendee()
})
</script>

<template>
  <div class="flex items-center justify-center p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <button 
          @click="router.back()" 
          class="btn btn-sm btn-ghost absolute left-4 top-4 mb-5"
        >
          ← Back
        </button>
        
        <div v-if="isLoading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-lg" />
        </div>
        
        <div v-else-if="error" class="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>
        
        <div v-else-if="attendee" class="space-y-8 text-center mt-10">
          <h2 class="text-2xl font-bold">{{ attendee.full_name }}</h2>
          
          <div class="space-y-1 text-gray-600">
            <p>{{ attendee.email }}</p>
            <p>{{ attendee.course }}</p>
            <p>{{ getYearLevelLabel(attendee) }}</p>
            <p>
              Status: 
              <span :class="attendee.has_attended ? 'text-green-700 font-extrabold' : 'text-red-600 font-extrabold'">
                {{ attendee.has_attended ? 'Attended' : 'Not Attended' }}
              </span>
            </p>
          </div>
          
          <div v-if="attendee.qr_code_path" class="flex justify-center p-3">
            <img 
              :src="'http://localhost:8000/storage/' + attendee.qr_code_path" 
              alt="QR Code" 
              class="w-64 h-64 rounded-md border-base-200 shadow-md "
            />
          </div>
          
          <div v-if="authState.user?.role === 'SBO' && !attendee.has_attended" class="pt-4">
            <button 
              @click="markAttendance"
              class="btn btn-primary w-full"
            >
              Mark as Attended
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>