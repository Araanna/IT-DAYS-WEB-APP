<script setup lang="ts">
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const { currentTheme, changeTheme } = inject('theme') as any;

const showMobileMenu = ref(false);

const toggleTheme = () => {
  changeTheme(currentTheme.value === 'green' ? 'lemonade' : 'green');
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="navbar bg-base-200 shadow-sm w-full">
    <!-- Logo/Brand -->
    <div class="flex-1">
      <router-link to="/" class="btn btn-ghost text-xl">AttendanceSys</router-link>
    </div>

    <!-- Desktop Navigation -->
    <div class="hidden md:flex">
      <ul class="menu menu-horizontal px-1 space-x-2">
        <!-- Auth Buttons -->
        <template v-if="!authStore.state.isAuthenticated">
          <li><router-link to="/login" class="btn btn-ghost">Login</router-link></li>
          <li><router-link to="/register" class="btn btn-primary">Register</router-link></li>
        </template>
        <template v-else>
          <li v-if="authStore.state.user?.role === 'SBO'">
            <router-link to="/dashboard" class="btn btn-ghost">Dashboard</router-link>
          </li>
          <li v-if="authStore.state.user?.role === 'SBO'">
            <router-link to="/attendance/log" class="btn btn-primary">Log Attendance</router-link>
          </li>
          <li>
            <button @click="handleLogout" class="btn btn-ghost">Logout</button>
          </li>
        </template>
        <!-- Theme Toggle -->
        <li>
          <button @click="toggleTheme" class="btn btn-ghost btn-circle">
            <svg v-if="currentTheme === 'green'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </li>
      </ul>
    </div>

    <!-- Mobile menu button -->
    <div class="md:hidden">
      <button class="btn btn-ghost btn-circle" @click="showMobileMenu = !showMobileMenu">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </div>

    <!-- Mobile Navigation -->
    <div v-if="showMobileMenu" class="md:hidden absolute top-16 right-0 left-0 bg-base-200 shadow-lg z-50">
      <ul class="menu p-4 space-y-2">
        <!-- Auth Buttons -->
        <template v-if="!authStore.state.isAuthenticated">
          <li><router-link to="/login" class="w-full btn btn-ghost">Login</router-link></li>
          <li><router-link to="/register" class="w-full btn btn-primary">Register</router-link></li>
        </template>
        <template v-else>
          <li v-if="authStore.state.user?.role === 'SBO'">
            <router-link to="/dashboard" class="w-full btn btn-ghost text-left">Dashboard</router-link>
          </li>
          <li v-if="authStore.state.user?.role === 'SBO'">
            <router-link to="/attendance/log" class="w-full btn btn-primary text-left">Log Attendance</router-link>
          </li>
          <li><button @click="handleLogout" class="w-full btn btn-ghost text-left">Logout</button></li>
        </template>
        <!-- Theme Toggle -->
        <li>
          <button @click="toggleTheme" class="w-full btn btn-ghost text-left">
            <span>Toggle Theme</span>
            <svg v-if="currentTheme === 'green'" class="w-5 h-5 inline-block ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
            <svg v-else class="w-5 h-5 inline-block ml-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>