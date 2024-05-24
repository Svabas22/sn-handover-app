<!-- contentComp.vue -->
<template>
  <div id="content-container" class="container mt-4">
    <div v-if="currentPage" class="main-container">
      <div class="header">
        <h1>Handover 2024-05-24 Night</h1>
        <div class="dropdown">
          <button class="btn btn-link text-decoration-none" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
            <li><a class="dropdown-item" href="#">Edit</a></li>
            <li><a class="dropdown-item" href="#" @click="showModal">Remove page</a></li>
          </ul>
        </div>
      </div>
      <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              Are you sure you want to delete this page?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
              <button type="button" class="btn btn-danger" @click="confirmDelete">Yes</button>
            </div>
          </div>
        </div>
      </div>
      <!-- Display engineers on shift -->
      <div>
        <h6>Engineers on Shift</h6>
        <ul>
          <li v-for="engineer in currentPage.engineersOnShift" :key="engineer.id">
            {{ engineer.name }}
          </li>
        </ul>
      </div>
      <!-- Display client data -->
      <div v-for="(client, clientName) in currentPage.clients" :key="clientName">
        <h6>{{ clientName }}</h6>
        <div v-for="(items, section) in client" :key="section">
          <h7>{{ section }}</h7>
          <ul>
            <li v-for="item in items" :key="item.id">
              {{ item.title }} - {{ item.status }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-else>No data available</div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['currentPage'])
  },
  methods: {
    showModal() {
      var myModal = new Modal(document.getElementById('deleteModal'), {
        keyboard: false
      });
      myModal.show();
    },
    confirmDelete() {
      // Your deletion logic here
      console.log('Page deleted');
      var myModal = Modal.getInstance(document.getElementById('deleteModal'));
      myModal.hide();
    }
  }
};
</script>

<style scoped>
.main-container {
    display: block;
}
.list-group {
    display: inline-block;
    width: auto; 
    background-color: #f8f9fa; 
    border: 1px solid rgba(0, 0, 0, .125); 
}

.list-group-item {
    display: block;
    width: 100%;
}

.list-group-item:last-child {
    border-bottom: none;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.edit {
    float: right;
}
.bi-three-dots-vertical {
  color: rgb(0, 0, 0);
}
</style>
