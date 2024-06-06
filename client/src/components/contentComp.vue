<template>
  <div id="content-container" class="container mt-4">
    <div v-if="currentPage" class="main-container">
      <div class="header">
        <h1>{{ currentPage.title }}</h1>
        <div class="dropwdowns-opt">
          <div class="dropdown-add">
          <button class="btn btn-link text-decoration-none" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-plus-lg"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
            <li><a class="dropdown-item" id="add-inc-btn" href="#">Add Incident</a></li>
            <li><a class="dropdown-item" id="add-prb-btn" href="#">Add Problem</a></li>
            <li><a class="dropdown-item" id="add-chg-btn" href="#">Add Change</a></li>
            <li><a class="dropdown-item" id="add-req-btn" href="#">Add Service Request</a></li>
          </ul>
        </div>
        <div class="dropdown">
          <button class="btn btn-link text-decoration-none" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
            <li><a class="dropdown-item" @click="toggleEditMode">{{ editMode ? 'Save' : 'Edit' }}</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" id="remove-btn" href="#" data-bs-toggle="modal" data-bs-target="#exampleModal">Remove page</a></li>
          </ul>
        </div>
      </div>
      </div>
      <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ...
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" id="remove-btn-mod" @click="deletePage" >Remove</button>
            </div>
          </div>
        </div>
      </div>
      <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <strong class="me-auto">Bootstrap</strong>
            <small>11 mins ago</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            Hello, world! This is a toast message.
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
        <div v-if="client.incidents.length > 0">
          <h7>Incidents</h7>
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Incident Number</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Main Problem</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="incident in client.incidents" :key="incident.incNumber">
                <td>{{ incident.incNumber }}</td>
                <td>
                  <div v-if="!editMode">{{ incident.status }}</div>
                  <div v-else>
                    <select v-model="incident.status">
                      <option value="Active">Active</option>
                      <option value="Awaiting user info">Awaiting User Info</option>
                      <option value="Awaiting third party">Awaiting Third Party</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div v-if="!editMode">{{ incident.priority }}</div>
                  <div v-else>
                    <select v-model="incident.priority">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div v-if="!editMode">{{ incident.mainProblem }}</div>
                  <div v-else>
                    <input type="text" v-model="incident.mainProblem" />
                  </div>
                </td>
                <td>
                  <div v-if="!editMode">{{ incident.notes }}</div>
                  <div v-else>
                    <input type="text" v-model="incident.notes" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div v-else>No data available</div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import axios from 'axios';

export default {
  data() {
    return {
      editMode: false,
    };
  },
  computed: {
    ...mapState(['currentPage']),
  },
  methods: {
    ...mapActions(['fetchPageDetails', 'updatePageDetails']),
    toggleEditMode() {
      if (this.editMode) {
        // Save the changes to the database
        this.updatePageDetails(this.currentPage);
      }
      this.editMode = !this.editMode;
    },
    deletePage() {
        if (confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
            axios.delete(`/api/records/${this.currentPage.id}`)
                .then(() => {
                    alert('Page successfully deleted');
                    this.$router.push({ name: 'HomePage' }); // Redirect to home page or appropriate page list
                })
                .catch(error => {
                    console.error('Error deleting page:', error);
                    alert('Error deleting page');
                });
        }
    }
  },
  created() {
    const docId = this.$route.params.id; // Assuming the document ID is passed as a route parameter
    this.fetchPageDetails(docId);
  },
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

.bi-three-dots-vertical, .bi-plus-lg {
  color: rgb(0, 0, 0);
}
#remove-btn {
  color: red;
}
#remove-btn-mod {
  color: red;
  background: white;
  border: 2px red;
}
.dropwdowns-opt {
  display: flex;
  color: rgb(0, 0, 0);
  gap: 10px; /* Add spacing between the buttons */
}
</style>
