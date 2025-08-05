<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { apiService } from "../services/api";
import type { User } from "../types/auth";

const { register } = useAuthStore();
const router = useRouter();

const user = ref<Omit<User, "id" | "message">>({
  full_name: "",
  email: "",
  password: "",
  password_confirmation: "",
  course: "",
  gender: "Male",
  year_level_id: undefined,
  role: "Attendee",
  position: "",
});

const yearLevels = ref<Array<{ id: number; label: string }>>([]);
const isLoading = ref(false);
const isFetchingYearLevels = ref(false);
const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref<"success" | "error">("success");

const showNotification = (message: string, type: "success" | "error") => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

const fetchYearLevels = async () => {
  try {
    isFetchingYearLevels.value = true;
    yearLevels.value = await apiService.getYearLevels();
  } catch (err) {
    console.error("Failed to fetch year levels:", err);
    showNotification("Failed to load year levels", "error");
  } finally {
    isFetchingYearLevels.value = false;
  }
};

const handleSubmit = async () => {
  // Client-side validation
  if (
    !user.value.email ||
    !user.value.password ||
    !user.value.full_name ||
    !user.value.course ||
    !user.value.year_level_id
  ) {
    showNotification("Please fill in all required fields including year level", "error");
    return;
  }

  if (user.value.password !== user.value.password_confirmation) {
    showNotification("Passwords do not match", "error");
    return;
  }

  try {
    isLoading.value = true;

    // Create a safe copy of user data for logging (without password)
    const loggableUserData = {
      ...user.value,
      password: "**REDACTED**",
      password_confirmation: "**REDACTED**"
    };
    console.log("Attempting to register user:", loggableUserData);
    console.log("Year level ID:", user.value.year_level_id);
    console.log("Year levels available:", yearLevels.value);

    // Register user
    await register(user.value);

    // Show success message
    showNotification("Registration successful! Redirecting to login...", "success");

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push("/login");
    }, 2000);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Registration error:", error.message);
      showNotification(error.message, "error");
    } else {
      console.error("Unexpected registration error:", error);
      showNotification("An unexpected error occurred", "error");
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchYearLevels();
});
</script>

<template>
  <div class="flex items-center justify-center bg-base-100 min-h-screen">
  <!-- Toast Notification - positioned absolutely at bottom right -->
<div class="fixed bottom-4 right-4 w-full max-w-md px-4">
  <div v-if="showToast" :class="['alert', toastType === 'success' ? 'alert-success' : 'alert-error', 'shadow-lg']">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="stroke-current shrink-0 h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        v-if="toastType === 'success'"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        v-else
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <span>{{ toastMessage }}</span>
  </div>
</div>  


    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-3xl font-bold justify-center">
          Create a new account
        </h2>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <!-- Form fields remain the same as your original -->
          <div class="form-control">
            <label for="full_name" class="label">
              <span class="label-text">Full Name</span>
            </label>
            <input
              id="full_name"
              v-model="user.full_name"
              type="text"
              required
              class="input input-bordered w-full"
              placeholder="Enter your full name"
            />
          </div>
          <div class="form-control">
            <label for="email" class="label">
              <span class="label-text">Email address</span>
            </label>
            <input
              id="email"
              v-model="user.email"
              type="email"
              required
              class="input input-bordered w-full"
              placeholder="Enter your email"
            />
          </div>
          <div class="form-control">
            <label for="password" class="label">
              <span class="label-text">Password</span>
            </label>
            <input
              id="password"
              v-model="user.password"
              type="password"
              required
              class="input input-bordered w-full"
              placeholder="Enter your password"
            />
          </div>
          <div class="form-control">
            <label for="password_confirmation" class="label">
              <span class="label-text">Confirm Password</span>
            </label>
            <input
              id="password_confirmation"
              v-model="user.password_confirmation"
              type="password"
              required
              class="input input-bordered w-full"
              placeholder="Confirm your password"
            />
          </div>
          <div class="form-control">
            <label for="course" class="label">
              <span class="label-text">Course</span>
            </label>
            <input
              id="course"
              v-model="user.course"
              type="text"
              required
              class="input input-bordered w-full"
              placeholder="Enter your course"
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Gender</span>
            </label>
            <div class="flex space-x-4">
              <label class="label cursor-pointer space-x-2">
                <span class="label-text">Male</span>
                <input
                  v-model="user.gender"
                  type="radio"
                  class="radio radio-primary"
                  value="Male"
                  checked
                />
              </label>
              <label class="label cursor-pointer space-x-2">
                <span class="label-text">Female</span>
                <input
                  v-model="user.gender"
                  type="radio"
                  class="radio radio-primary"
                  value="Female"
                />
              </label>
            </div>
          </div>
          <div class="form-control">
            <label for="year_level_id" class="label">
              <span class="label-text">Year Level</span>
            </label>
            <select
              id="year_level_id"
              v-model="user.year_level_id"
              class="select select-bordered w-full"
              :disabled="isFetchingYearLevels"
              required
            >
              <option disabled :value="undefined">Select year level</option>
              <option
                v-for="level in yearLevels"
                :key="level.id"
                :value="level.id"
              >
                {{ level.label }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <label for="role" class="label">
              <span class="label-text">Role</span>
            </label>
            <select
              id="role"
              v-model="user.role"
              class="select select-bordered w-full"
              required
            >
              <option value="Attendee">Attendee</option>
              <option value="SBO">SBO</option>
            </select>
          </div>
          <div v-if="user.role === 'SBO'" class="form-control">
            <label for="position" class="label">
              <span class="label-text">Position</span>
            </label>
            <input
              id="position"
              v-model="user.position"
              type="text"
              required
              class="input input-bordered w-full"
              placeholder="Enter your position"
            />
          </div>

          <div class="form-control mt-6">
            <button
              type="submit"
              class="btn btn-primary w-full"
              :disabled="isLoading"
            >
              <span v-if="isLoading">
                <span class="loading loading-spinner"></span>
                Processing...
              </span>
              <span v-else>Register</span>
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
          <router-link
            to="/login"
            class="text-sm text-primary hover:text-primary-content font-medium"
          >
            Already have an account? Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>