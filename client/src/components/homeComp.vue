<template>
  <div id="home-container">
      <NavBarComponent/>
    <div class="main-container">
      <aside class="sidebar">
        <SideBarComponent />
      </aside>
      <div class="content">
        <shiftComp />
      </div>
    </div>
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
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';
import NavBarComponent from './NavBar.vue';
import SideBarComponent from './sideBar.vue';
import shiftComp from './contentComp.vue';
import { mapState } from 'vuex';
export default {
  components: {
    NavBarComponent,
    SideBarComponent,
    shiftComp
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
};
</script>

<style>
#home-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Use viewport height to make it fit the entire screen */
  width: 100vw; /* Ensures full viewport width usage */
  overflow: hidden; /* Ensures that overflow is only handled by specific children */
}

.navbar {
  flex-shrink: 0; /* Ensures the navbar does not shrink */
}

.main-container {
  display: flex;
  flex-direction: row;
  flex-grow: 1; /* Allows this container to take up all available space */
  height: calc(100vh - 56px); /* Subtract the height of the navbar if it's fixed height */
  overflow: hidden; /* Prevents scroll on the main container */
}

.sidebar {
  width: 280px; /* Fixed width for the sidebar */
  background-color: #f8f9fa;
  overflow-y: auto; /* Allows scrolling inside the sidebar if needed */
}

.content {
  flex-grow: 1;
  overflow-y: auto; /* Allows scrolling within the content area only */
  padding: 20px;
}

.toast-container {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 1050; /* High z-index to ensure it's above other content */
  padding: 1rem;
  width: auto;
  color: white;
}

.toast {
  min-width: 250px;
}
</style>