<template>
  <div id="content-container" class="container mt-4">
    <div v-if="currentPage" class="main-container">
      <div class="header">
        <h1>{{ currentPage.title }}</h1>
        <div class="dropdown">
          <button class="btn btn-link text-decoration-none" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
            <li><a class="dropdown-item" @click="toggleEditMode">{{ editMode ? 'Save' : 'Edit' }}</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" id="remove-btn" href="#">Remove page</a></li>
          </ul>
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
.edit {
    float: right;
}
.bi-three-dots-vertical {
  color: rgb(0, 0, 0);
}
#remove-btn {
  color: red;
}
</style>
