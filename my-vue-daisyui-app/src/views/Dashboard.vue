<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { apiService } from "../services/api";
import type { User } from "../types/auth";
import QrScanner from "./QrScanner.vue";
import AttendanceViewer from "./AttendanceViewer.vue";

const showAttendanceViewer = ref(false);
const router = useRouter();
const { state: authState, fetchUser } = useAuthStore();

const attendees = ref<User[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const yearLevels = ref<Array<{ id: number; label: string }>>([]);
const showScanner = ref(false);

const handleScanSuccess = (attendeeId: number) => {
  console.log(`Attendance marked for user ID: ${attendeeId}`);
  // Update the local attendees list if needed
  const attendeeIndex = attendees.value.findIndex((a) => a.id === attendeeId);
  if (attendeeIndex !== -1) {
    attendees.value[attendeeIndex].has_attended = true;
  }
};

const fetchYearLevels = async () => {
  try {
    yearLevels.value = await apiService.getYearLevels();
  } catch (err) {
    console.error("Failed to fetch year levels:", err);
  }
};

const fetchAttendees = async () => {
  try {
    if (!authState.token) return;

    isLoading.value = true;
    error.value = null;

    attendees.value = await apiService.getAttendees(authState.token);
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to fetch attendees";
    console.error("Error fetching attendees:", err);
  } finally {
    isLoading.value = false;
  }
};

const markAttendance = async (attendeeId: number) => {
  try {
    if (!authState.token) return;

    const data = await apiService.scanAttendee(authState.token, attendeeId);

    const attendeeIndex = attendees.value.findIndex((a) => a.id === attendeeId);
    if (attendeeIndex !== -1) {
      attendees.value[attendeeIndex].has_attended = true;
    }

    alert("Attendance marked successfully!");
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to mark attendance";
    console.error("Error marking attendance:", err);
  }
};

const getYearLevelLabel = (user: User | null) => {
  if (!user) return "N/A";

  // If API returns direct string (like /api/me response)
  if (typeof user.year_level === "string") {
    return user.year_level;
  }

  // If API returns year_level object with label
  if (user.year_level && typeof user.year_level === "object") {
    return user.year_level.label;
  }

  // If only year_level_id is available
  if (user.year_level_id) {
    const level = yearLevels.value.find((yl) => yl.id === user.year_level_id);
    return level ? level.label : "N/A";
  }

  return "N/A";
};

onMounted(async () => {
  await fetchYearLevels();
  await fetchUser();

  if (authState.user?.role === "SBO") {
    await fetchAttendees();
  }
});
</script>

<template>
  <div class="w-full max-w-6xl mx-auto space-y-8 p-4">
    <!-- User Profile Card -->
    <div class="card shadow-2xl bg-base-100">
      <div class="card-body">
        <h2 class="card-title text-2xl mb-4">Dashboard</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p class="text-lg">
              Welcome back,
              <span class="font-bold">{{
                authState.user?.full_name || authState.user?.email || "User"
              }}</span
              >!
            </p>
            <p class="text-sm text-gray-500">
              You're logged in with: {{ authState.user?.email }}
            </p>
            <div class="mt-4 space-y-2">
              <p>
                <span class="font-semibold">Role:</span>
                {{ authState.user?.role }}
              </p>
              <p v-if="authState.user?.position">
                <span class="font-semibold">Position:</span>
                {{ authState.user.position }}
              </p>
              <p>
                <span class="font-semibold">Course:</span>
                {{ authState.user?.course }}
              </p>
              <p>
                <span class="font-semibold">Gender:</span>
                {{ authState.user?.gender }}
              </p>
              <p>
                <span class="font-semibold">Year Level:</span>
                {{ getYearLevelLabel(authState.user) }}
              </p>
              <p>
                <span class="font-semibold">Attendance Status:</span>
                <span
                  :class="
                    authState.user?.has_attended
                      ? 'text-green-700 font-extrabold'
                      : 'text-red-600 font-extrabold'
                  "
                >
                  {{
                    authState.user?.has_attended ? "Attended" : "Not Attended"
                  }}
                </span>
              </p>
              
              <!-- Attendance Log Button for SBO only -->
              <div v-if="authState.user?.role === 'SBO'" class="mt-4">
                <router-link 
                  to="/attendance/log" 
                  class="btn btn-primary w-full"
                >
                  Log Attendance
                </router-link>
              </div>
            </div>
          </div>
          <div v-if="authState.user?.qr_code_path" class="flex justify-center">
            <div
              class="bg-white p-2 rounded-lg border border-gray-300 shadow-md"
            >
              <img
                :src="
                  'http://localhost:8000/storage/' + authState.user.qr_code_path
                "
                alt="QR Code"
                class="w-48 h-48"
              />
              <p class="text-center mt-2 text-sm text-inherit font-bold">Your QR Code</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendees List (for SBO only) -->
    <div
      v-if="authState.user?.role === 'SBO'"
      class="card shadow-2xl bg-base-100"
    >
      <div class="card-body">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
        >
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Attendees List
          </h2>

          <div class="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
            <button
              @click="showAttendanceViewer = true"
              class="btn btn-outline btn-primary flex items-center gap-2"
            >
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              View Records
            </button>

            <button
              @click="showScanner = true"
              class="btn btn-primary flex items-center gap-2"
            >
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
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              Scan QR Code
            </button>
          </div>
        </div>
        <div v-if="isLoading" class="flex justify-center">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else-if="error" class="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ error }}</span>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Year Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="attendee in attendees" :key="attendee.id">
                <td>{{ attendee.full_name }}</td>
                <td>{{ attendee.email }}</td>
                <td>{{ attendee.course }}</td>
                <td>{{ getYearLevelLabel(attendee) }}</td>
                <td>
                  <span
                    :class="
                      attendee.has_attended
                        ? 'text-green-700 font-extrabold'
                        : 'text-red-600 font-extrabold'
                    "
                  >
                    {{ attendee.has_attended ? "Attended" : "Not Attended" }}
                  </span>
                </td>
                <td>
                  <button
                    @click="router.push(`/qr/${attendee.id}`)"
                    class="btn btn-sm btn-info mr-2"
                  >
                    View QR
                  </button>
                  <button
                    v-if="!attendee.has_attended"
                    @click="markAttendance(attendee.id!)"
                    class="btn btn-sm btn-success"
                  >
                    Mark Attended
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <QrScanner
      v-if="showScanner"
      @scan-success="handleScanSuccess"
      @close="showScanner = false"
    />

    <div
      v-if="showAttendanceViewer"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <AttendanceViewer @close="showAttendanceViewer = false" />
      </div>
    </div>
  </div>
</template>
