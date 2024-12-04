<template>
  <div id="app">
    <router-view />

    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div v-for="toast in toasts" :key="toast.id" :data-id="toast.id" class="toast" :class="`bg-${toast.type}`">
        <div class="d-flex">
          <div class="toast-body">
            {{ toast.message }}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';

export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false
    }
  },
  created() {
    this.checkAuthentication();
  },
  computed: {
    ...mapState(['toasts'])
  },
  watch: {
    toasts: {
      immediate: true,
      deep: true,
      handler(toasts) {
        toasts.forEach(toast => {
          this.initializeToast(toast);
        });
      }
    }
  },
  methods: {
    checkAuthentication() {
      this.isAuthenticated = localStorage.getItem('userAuthenticated') ? true : false;

      if (!this.isAuthenticated) {
        this.$router.push('/login');
      }
    },
    initializeToast(toast) {
      this.$nextTick(() => {
        const toastEl = document.querySelector(`.toast[data-id="${toast.id}"]`);
        if (toastEl) {
          const bsToast = new bootstrap.Toast(toastEl);
          bsToast.show();
        } else {
          console.error('Toast element not found', toast);
        }
      });
    }
  }
}
</script>

<style>
:root {
  --primary-color: #007bff;
  --secondary-color: #828a91;
  --success-color: #28a745;
  --info-color: #17a2b8;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
}
button {
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
  appearance: none;
}

.toast-container {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 1050; 
  padding: 1rem;
  width: auto;
  color: white;
}

.toast {
  min-width: 250px;
}
</style>
