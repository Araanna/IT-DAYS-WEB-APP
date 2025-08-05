<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import Navbar from './components/Navbar.vue';

// Theme management
const currentTheme = ref('lemonade');
const changeTheme = (themeName: string) => {
  document.documentElement.setAttribute('data-theme', themeName);
  currentTheme.value = themeName;
  localStorage.setItem('daisyui-theme', themeName);
};

// Initialize theme on mount
onMounted(() => {
  // Theme initialization
  const savedTheme = localStorage.getItem('daisyui-theme');
  if (savedTheme) {
    changeTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    changeTheme(prefersDark ? 'green' : 'lemonade');
  }
});

// Provide theme to child components
provide('theme', {
  currentTheme,
  changeTheme
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-base-100 text-base-content">
    <Navbar />
    <main class="flex-grow container mx-auto px-4 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="footer footer-center p-4 bg-base-200 text-base-content">
      <aside>
        <p>Copyright © 2023 - All right reserved</p>
      </aside>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>