//view/QrScanner.vue

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { Html5Qrcode } from 'html5-qrcode';
import { useRouter } from 'vue-router';

const emit = defineEmits(['scan-success', 'close']);
const authStore = useAuthStore();
const router = useRouter();
const scanner = ref<Html5Qrcode | null>(null);
const scanResult = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const isScanning = ref(false);
const isLoading = ref(false);
const toastMessage = ref<string | null>(null);
const toastType = ref<'success' | 'error' | null>(null);

const showToast = (message: string, type: 'success' | 'error') => {
  toastMessage.value = message;
  toastType.value = type;
  setTimeout(() => {
    toastMessage.value = null;
    toastType.value = null;
  }, 3000);
};

const startScanner = async () => {
  try {
    const html5QrCode = new Html5Qrcode('qr-reader');
    scanner.value = html5QrCode;
    
    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 } 
    };

    isScanning.value = true;
    errorMessage.value = null;
    
    await html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      () => {
        // Silent error handling for scanning process
      }
    );
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to start scanner';
    console.error('Scanner error:', err);
    isScanning.value = false;
    showToast(errorMessage.value, 'error');
  }
};

const handleScanSuccess = async (decodedText: string) => {
  try {
    scanResult.value = decodedText;
    isLoading.value = true;
    
    const urlParts = decodedText.split('/');
    let attendeeId = urlParts[urlParts.length - 1];
    
    if (!attendeeId) {
      attendeeId = urlParts[urlParts.length - 2];
    }

    if (!attendeeId || isNaN(Number(attendeeId))) {
      throw new Error('Invalid QR code format - ID not found');
    }
    
    const response = await fetch(`http://localhost:8000/api/scan/${attendeeId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.state.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark attendance');
    }

    console.log('API Response:', data);
    
    emit('scan-success', Number(attendeeId));
    stopScanner();
    
    if (data.message === 'Already marked as attended.') {
      showToast('This attendee was already marked!', 'error');
    } else {
      showToast('Attendance marked successfully!', 'success');
    }
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 5000);
    
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to process QR code';
    console.error('Scan processing error:', err);
    showToast(errorMessage.value, 'error');
  } finally {
    isLoading.value = false;
  }
};

const stopScanner = () => {
  if (scanner.value && scanner.value.isScanning) {
    scanner.value.stop().then(() => {
      scanner.value = null;
      isScanning.value = false;
    }).catch(err => {
      console.error('Failed to stop scanner:', err);
    });
  }
  emit('close');
};

onMounted(() => {
  startScanner();
});

onUnmounted(() => {
  stopScanner();
});
</script>

<template>
  <div class="fixed inset-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative overflow-hidden">
      <!-- Decorative header gradient -->
      <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-gray-800">Scan QR Code</h3>
        <button 
          @click="stopScanner" 
          class="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Toast Notification -->
      <transition name="fade">
        <div 
          v-if="toastMessage"
          :class="[
            'fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 max-w-sm',
            toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
          ]"
        >
          <svg v-if="toastType === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm">{{ toastMessage }}</span>
        </div>
      </transition>

      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-100 text-red-800 p-4 rounded-lg mb-6 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm">{{ errorMessage }}</span>
      </div>

      <!-- QR Scanner -->
      <div id="qr-reader" class="w-full h-72 mb-6 rounded-lg overflow-hidden border-2 border-gray-200 relative">
        <div v-if="isScanning" class="absolute inset-0 border-4 border-blue-500/30 animate-pulse"></div>
      </div>

      <!-- Scan Result -->
      <div v-if="scanResult" class="bg-gray-50 p-4 rounded-lg mb-6">
        <p class="text-sm text-gray-600">Scanned Result:</p>
        <p class="text-sm font-medium text-gray-800 break-all">{{ scanResult }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center mb-6">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span class="ml-3 text-gray-600">Processing...</span>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end gap-3">
        <button 
          v-if="!isScanning && !isLoading" 
          @click="startScanner" 
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          Restart Scanner
        </button>
        <button 
          @click="stopScanner" 
          class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
