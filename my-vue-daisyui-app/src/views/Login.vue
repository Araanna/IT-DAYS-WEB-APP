//view/Login.vue

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const { login } = useAuthStore();

const credentials = ref({
  email: "",
  password: "",
});

const isLoading = ref(false);
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

const handleSubmit = async () => {
  if (!credentials.value.email || !credentials.value.password) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  try {
    isLoading.value = true;

    await login(credentials.value);
    showNotification("Login successful! Redirecting...", "success");

    // Wait 2 seconds before redirecting (matches register behavior)
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  } catch (err: unknown) {
    if (err instanceof Error) {
      showNotification(err.message, "error");
    } else {
      showNotification("An unexpected error occurred", "error");
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
<template>
  <div class="flex items-center justify-center min-h-screen bg-base-100 p-4">
    <!-- Main Card Content -->
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-3xl font-bold text-base-content justify-center">
          Sign in to your account
        </h2>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <div class="form-control">
            <label for="email" class="label">
              <span class="label-text text-base-content">Email address</span>
            </label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              required
              class="input input-bordered w-full"
              placeholder="Enter your email"
            />
          </div>
          <div class="form-control">
            <label for="password" class="label">
              <span class="label-text text-base-content">Password</span>
            </label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              required
              class="input input-bordered w-full"
              placeholder="Enter your password"
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
              <span v-else>Sign in</span>
            </button>
          </div>
        </form>

        <div class="text-center mt-4">
          <router-link
            to="/register"
            class="text-sm text-primary hover:text-primary-content font-medium"
          >
            Don't have an account? Register
          </router-link>
        </div>
      </div>
    </div>

    <!-- Toast Notification - Fixed at bottom right -->
    <div class="fixed bottom-0 right-0 w-full max-w-md p-4">
      <transition name="fade">
        <div
          v-if="showToast"
          :class="[
            'alert',
            toastType === 'success' ? 'alert-success' : 'alert-error',
            'shadow-lg',
            'mb-4'  // Adds small margin from bottom
          ]"
        >
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
      </transition>
    </div>
  </div>
</template>