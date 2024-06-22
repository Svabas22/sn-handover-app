<template>
  <div id="content-container" class="container mt-4">
    <div v-if="currentPage" class="main-container">
      <div class="header">
        <h1>{{ currentPage.title }}</h1>
        <div :class="{'dropwdowns-opt': true, 'disabled': !isEngineer}">
          <div class="dropdown-add">
            <button class="btn btn-link text-decoration-none" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-plus-lg"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
              <li><a class="dropdown-item" id="add-inc-btn" href="#" data-bs-toggle="modal" data-bs-target="#addIncidentModal">Add Incident</a></li>
              <li><a class="dropdown-item" id="add-prb-btn" href="#" data-bs-toggle="modal" data-bs-target="#addProblemModal">Add Problem</a></li>
              <li><a class="dropdown-item" id="add-chg-btn" href="#" data-bs-toggle="modal" data-bs-target="#addChangeModal">Add Change</a></li>
              <li><a class="dropdown-item" id="add-req-btn" href="#" data-bs-toggle="modal" data-bs-target="#addRequestModal">Add Service Request</a></li>
            </ul>
          </div>
          <div class="dropdown">
            <button class="btn btn-link text-decoration-none" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
              <li><a class="dropdown-item" @click="toggleEditMode">{{ editMode ? 'Save' : 'Edit' }}</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" id="remove-btn" href="#" data-bs-toggle="modal" data-bs-target="#removePageModal">Remove page</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Add Incident Modal -->
      <div class="modal fade" id="addIncidentModal" tabindex="-1" aria-labelledby="addIncidentModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addIncidentModalLabel">Add Incident</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveIncident">
                <div class="mb-3">
                  <label for="clientSelect" class="form-label">Client</label>
                  <select class="form-select" id="clientSelect" v-model="newIncident.client" required>
                    <option v-for="(client, clientName) in currentPage.clients" :key="clientName" :value="clientName">{{ clientName }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="incidentNumber" class="form-label">Incident Number</label>
                  <input type="text" class="form-control" id="incidentNumber" v-model="newIncident.incNumber" required>
                </div>
                <div class="mb-3">
                  <label for="status" class="form-label">Status</label>
                  <select class="form-select" id="status" v-model="newIncident.status" required>
                    <option value="Active">Active</option>
                    <option value="Awaiting user info">Awaiting User Info</option>
                    <option value="Awaiting third party">Awaiting Third Party</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="dateOpened" class="form-label">Date Opened</label>
                  <input type="datetime-local" class="form-control" id="dateOpened" v-model="newIncident.dateOpened" :max="maxDate" required>
                </div>
                <div class="mb-3">
                  <label for="priority" class="form-label">Priority</label>
                  <select class="form-select" id="priority" v-model="newIncident.priority" required>
                    <option value="P4 - Low">P4 - Low</option>
                    <option value="P3 - moderate">P3 - moderate</option>
                    <option value="P2 - high">P2 - high</option>
                    <option value="P1 - Critical">P1 - Critical</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="mainProblem" class="form-label">Main Problem</label>
                  <input type="text" class="form-control" id="mainProblem" v-model="newIncident.mainProblem" required>
                </div>
                <div class="mb-3">
                  <label for="notes" class="form-label">Notes</label>
                  <textarea class="form-control" id="notes" v-model="newIncident.notes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" class="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <!-- Add Problem Modal -->
      <div class="modal fade" id="addProblemModal" tabindex="-1" aria-labelledby="addProblemModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addProblemModalLabel">Add Problem</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveProblem">
                <div class="mb-3">
                  <label for="clientSelect" class="form-label">Client</label>
                  <select class="form-select" id="clientSelect" v-model="newProblem.client" required>
                    <option v-for="(client, clientName) in currentPage.clients" :key="clientName" :value="clientName">{{ clientName }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="problemNumber" class="form-label">Problem Number</label>
                  <input type="text" class="form-control" id="problemNumber" v-model="newProblem.prbNumber" required>
                </div>
                <div class="mb-3">
                  <label for="status" class="form-label">Status</label>
                  <select class="form-select" id="status" v-model="newProblem.status" required>
                    <option value="Evaluate">Evaluate</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Investigate">Investigate</option>
                    <option value="Review">Review</option>
                    <option value="Remediate">Remediate</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="priority" class="form-label">Priority</label>
                  <select class="form-select" id="priority" v-model="newProblem.priority" required>
                    <option value="P4 - Low">P4 - Low</option>
                    <option value="P3 - moderate">P3 - moderate</option>
                    <option value="P2 - high">P2 - high</option>
                    <option value="P1 - Critical">P1 - Critical</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="rca" class="form-label">Root cause analysis</label>
                  <input type="text" class="form-control" id="rca" v-model="newProblem.rca" required>
                </div>
                <div class="mb-3">
                  <label for="notes" class="form-label">Notes</label>
                  <textarea class="form-control" id="notes" v-model="newProblem.notes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" class="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <!-- Add change Modal -->
      <div class="modal fade" id="addChangeModal" tabindex="-1" aria-labelledby="addChangeModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addChangeModalLabel">Add Change</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveChange">
                <div class="mb-3">
                  <label for="clientSelect" class="form-label">Client</label>
                  <select class="form-select" id="clientSelect" v-model="newChange.client" required>
                    <option v-for="(client, clientName) in currentPage.clients" :key="clientName" :value="clientName">{{ clientName }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="changeNumber" class="form-label">Change Number</label>
                  <input type="text" class="form-control" id="changeNumber" v-model="newChange.chgNumber" required>
                </div>
                <div class="mb-3">
                  <label for="status" class="form-label">Status</label>
                  <select class="form-select" id="status" v-model="newChange.status" required>
                      <option value="New">New</option>
                      <option value="Assess">Assess</option>
                      <option value="Authorize">Authorize</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Implement">Implement</option>
                      <option value="Review">Review</option>
                      <option value="Closed">Closed</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="startDate" class="form-label">Start Date</label>
                  <input type="datetime-local" class="form-control" id="startDate" v-model="newChange.startDate" required>
                </div>
                <div class="mb-3">
                  <label for="endDate" class="form-label">End Date</label>
                  <input type="datetime-local" class="form-control" id="endDate" v-model="newChange.endDate" required>
                </div>
                <div class="mb-3">
                  <label for="notes" class="form-label">Notes</label>
                  <textarea class="form-control" id="notes" v-model="newChange.notes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" class="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <!-- Req page Modal -->
      <div class="modal fade" id="addRequestModal" tabindex="-1" aria-labelledby="addRequestModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="addRequestModalLabel">Add Service Request</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveRequest">
                <div class="mb-3">
                  <label for="clientSelect" class="form-label">Client</label>
                  <select class="form-select" id="clientSelect" v-model="newRequest.client" required>
                    <option v-for="(client, clientName) in currentPage.clients" :key="clientName" :value="clientName">{{ clientName }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="ritmNumber" class="form-label">Service Request Number</label>
                  <input type="text" class="form-control" id="ritmNumber" v-model="newRequest.ritmNumber" required>
                </div>
                <div class="mb-3">
                  <label for="status" class="form-label">Status</label>
                  <select class="form-select" id="status" v-model="newRequest.status" required>
                    <option value="Draft">Draft</option>
                    <option value="Awaiting Approval">Awaiting Approval</option>
                    <option value="Pending">Pending</option>
                    <option value="Work in Progress">Work in Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="notes" class="form-label">Short request description</label>
                  <textarea class="form-control" id="notes" v-model="newRequest.desc" rows="3"></textarea>
                </div>
                <div class="mb-3">
                  <label for="notes" class="form-label">Notes</label>
                  <textarea class="form-control" id="notes" v-model="newRequest.notes" rows="3"></textarea>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="submit" class="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <!-- Remove page Modal -->
      <div class="modal fade" id="removePageModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-body">
              Are you sure you want to remove {{ currentPage.title }}? This action cannot be undone.
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" class="btn btn-primary" id="liveToastBtn" @click="removePage" >Remove</button>
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
            {{ currentPage.title }} successfully deleted.
          </div>
        </div>
      </div>
      <!-- Display engineers on shift -->
      <div>
        <h5>Engineers on Shift</h5>
        <div v-if="!editMode">
          <ul>
            <li v-for="engineer in currentPage.engineersOnShift" :key="engineer.id">
              {{ engineer.name }}
            </li>
          </ul>
        </div>
        <div v-else>
          <select v-model="selectedShiftId" @change="updateEngineersOnShift">
            <option v-for="shift in shifts" :key="shift.id" :value="shift.id">
              {{ shift.title }}
            </option>
          </select>
        </div>
      </div>
      <!-- Display client data -->
      <div v-for="(client, clientName) in currentPage.clients" :key="clientName">
      <h5>{{ clientName }}</h5>
      <div v-if="client.incidents.length > 0">
        <h6>Incidents</h6>
        <table class="table table-fixed">
          <thead>
            <tr>
              <th>Incident Number</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Date Opened</th>
              <th class="main-problem">Main Problem</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="incident in client.incidents" :key="incident.incNumber" required>
              <td>{{ incident.incNumber }}</td>
              <td>
                <div v-if="!editMode">{{ incident.status }}</div>
                <div v-else>
                  <select v-model="incident.status" required>
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
                  <select v-model="incident.priority" required>
                    <option value="P4 - Low">P4 - Low</option>
                    <option value="P3 - moderate">P3 - moderate</option>
                    <option value="P2 - high">P2 - high</option>
                    <option value="P1 - Critical">P1 - Critical</option>
                  </select>
                </div>
              </td>
              <td>
                <div v-if="!editMode">{{ incident.dateOpened }}</div>
                <div v-else>
                  <input type="datetime-local" class="form-control" id="dateOpened" v-model="incident.dateOpened" :max="maxDate" required>
                </div>
              </td>
              <td class="main-problem">
                <div v-if="!editMode">{{ incident.mainProblem }}</div>
                <div v-else>
                  <textarea type="text" v-model="incident.mainProblem" class="form-control custom-textarea"></textarea>
                </div>
              </td>
              <td>
                <div v-if="!editMode">{{ incident.notes }}</div>
                <div v-else>
                  <textarea type="text" v-model="incident.notes" class="form-control custom-textarea"></textarea>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="client.problems.length > 0">
        <h6>Problems</h6>
        <table class="table table-fixed">
          <thead>
            <tr>
              <th>Problem Number</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Root Cause analysis</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="problem in client.problems" :key="problem.prbNumber" required>
              <td>{{ problem.prbNumber }}</td>
              <td>
                <div v-if="!editMode">{{ problem.status }}</div>
                <div v-else>
                  <select v-model="problem.status" required>
                    <option value="Active">Active</option>
                    <option value="Awaiting user info">Awaiting User Info</option>
                    <option value="Awaiting third party">Awaiting Third Party</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </td>
              <td>
                <div v-if="!editMode">{{ problem.priority }}</div>
                <div v-else>
                  <select v-model="problem.priority" required>
                    <option value="P4 - Low">P4 - Low</option>
                    <option value="P3 - moderate">P3 - moderate</option>
                    <option value="P2 - high">P2 - high</option>
                    <option value="P1 - Critical">P1 - Critical</option>
                  </select>
                </div>
              </td>
              <td>
                <div v-if="!editMode">{{ problem.rca }}</div>
                <div v-else>
                  <textarea type="text" v-model="problem.rca" class="form-control custom-textarea" required></textarea>
                </div>
              </td>
              <td>
                <div v-if="!editMode">{{ problem.notes }}</div>
                <div v-else>
                  <textarea type="text" v-model="problem.notes" class="form-control custom-textarea"></textarea>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="client.changes.length > 0">
        <h6>Changes</h6>
        <table class="table table-fixed">
          <thead>
            <tr>
              <th>Change Number</th>
              <th>Status</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="change in client.changes" :key="change.chgNumber" required>
              <td>{{ change.chgNumber }}</td>
              <td>
                <div v-if="!editMode">{{ change.status }}</div>
                <div v-else>
                  <select v-model="change.status" required>
                    <option value="New">New</option>
                    <option value="Assess">Assess</option>
                    <option value="Authorize">Authorize</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Implement">Implement</option>
                    <option value="Review">Review</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </td>
              <td>
                <div v-if="!editMode">{{ change.startDate }}</div>
                <div v-else>
                  <input type="datetime-local" class="form-control" id="startDate" v-model="change.startDate" required/>
                </div>
              </td>
              <td>
                <div v-if="!editMode">{{ change.endDate }}</div>
                <div v-else>
                  <input type="datetime-local" class="form-control" id="endDate" v-model="change.endDate" required/>
                </div>
              </td>
              <td>
                <div v-if="!editMode">{{ change.notes }}</div>
                <div v-else>
                  <textarea type="text" v-model="change.notes" class="form-control custom-textarea"></textarea>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="client.serviceRequests.length > 0">
        <h6>Service Requests</h6>
        <table class="table table-fixed">
          <thead>
            <tr>
              <th>Request Number</th>
              <th>Status</th>
              <th class="short-request-description">Short request description</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in client.serviceRequests" :key="request.ritmNumber" required>
              <td>{{ request.ritmNumber }}</td>
              <td>
                <div v-if="!editMode">{{ request.status }}</div>
                <div v-else>
                  <select v-model="request.status" required>
                    <option value="Draft">Draft</option>
                    <option value="Awaiting Approval">Awaiting Approval</option>
                    <option value="Pending">Pending</option>
                    <option value="Work in Progress">Work in Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </td>
              <td class="short-request-description">
                <div v-if="!editMode">{{ request.desc }}</div>
                <div v-else>
                  <textarea type="text" v-model="request.desc" class="form-control custom-textarea" required></textarea>
                </div>
              </td>
              <td>
                <div v-if="!editMode">{{ request.notes }}</div>
                <div v-else>
                  <textarea type="text" v-model="request.notes" class="form-control custom-textarea"></textarea>
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
//import axios from 'axios';

export default {
  data() {
    return {
      editMode: false,
      userProfile: { role: localStorage.getItem('roles') },
      newIncident: {
        client: '',
        incNumber: '',
        status: 'Active',
        dateOpened: '',
        priority: 'P4 - Low',
        mainProblem: '',
        notes: ''
      },
      newProblem: {
        client: '',
        prbNumber: '',
        status: 'Evaluate',
        priority: 'P4 - Low',
        rca: '',
        notes: ''
      },
      newChange: {
        client: '',
        chgNumber: '',
        status: 'New',
        startDate: '',
        endDate: '',
        notes: ''
      },
      newRequest: {
        client: '',
        ritmNumber: '',
        status: 'Draft',
        desc: '',
        notes: ''
      }
    };
  },
  computed: {
    ...mapState(['currentPage', 'pages', 'shifts', 'currentShift', 'toasts']),
    isEngineer() {
      return this.userProfile.role === 'Engineer';
    },
    maxDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const hours = String(today.getHours()).padStart(2, '0');
      const minutes = String(today.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  },
  methods: {
    ...mapActions(['fetchPageDetails', 'debouncedUpdatePageDetails', 'deletePage', 'addToast', 'fetchPages', 'setPages', 'setCurrentPage', 'fetchShifts', 'fetchShiftDetails']),
    toggleEditMode() {
      if (this.editMode) {
        if (this.hasChanges()) {
          this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
          this.$socket.emit('editPage', this.currentPage);
        }
      }
      this.editMode = !this.editMode;
    },
    hasChanges() {
      return JSON.stringify(this.currentPage) !== JSON.stringify(this.originalPageState);
    },
    //--Shift addition--
    async updateEngineersOnShift() {
      if (this.selectedShiftId) {
        const selectedShift = this.shifts.find(shift => shift.id === this.selectedShiftId);
        if (selectedShift) {
          this.currentPage.engineersOnShift = selectedShift.engineers;
        }
      }
    },
    //--INC addition--
    async saveIncident() {
      const client = this.currentPage.clients[this.newIncident.client];
      client.incidents.push({
        incNumber: this.newIncident.incNumber,
        status: this.newIncident.status,
        dateOpened: this.newIncident.dateOpened,
        priority: this.newIncident.priority,
        mainProblem: this.newIncident.mainProblem,
        notes: this.newIncident.notes
      });

      try {
        await this.debouncedUpdatePageDetails(this.currentPage);
        this.$socket.emit('editPage', this.currentPage);
        this.resetNewIncident();
        this.$router.push({ name: 'HomePage' });
      } catch (error) {
        console.error('Error saving incident:', error);
        this.addToast({ message: 'Error saving incident:', type: 'danger' });
      }
    },
    resetNewIncident() {
      this.newIncident = {
        client: '',
        incNumber: '',
        status: 'Active',
        dateOpened: '',
        priority: 'P4 - Low',
        mainProblem: '',
        notes: ''
      };
    },
    //--Problem addition--
    async saveProblem() {
      const client = this.currentPage.clients[this.newProblem.client];
      client.problems.push({
        prbNumber: this.newProblem.prbNumber,
        status: this.newProblem.status,
        priority: this.newProblem.priority,
        rca: this.newProblem.rca,
        notes: this.newProblem.notes
      });

      try {
        await this.debouncedUpdatePageDetails(this.currentPage);
        this.$socket.emit('editPage', this.currentPage);
        this.resetNewProblem();
        this.$router.push({ name: 'HomePage' });
      } catch (error) {
        console.error('Error saving problem:', error);
        this.addToast({ message: 'Error saving problem:', type: 'danger' });
      }
    },
    resetNewProblem() {
      this.newProblem = {
        client: '',
        prbNumber: '',
        status: 'Active',
        priority: 'P4 - Low',
        rca: '',
        notes: ''
      };
    },
    //--Change addition--
    async saveChange() {
      const client = this.currentPage.clients[this.newChange.client];
      client.changes.push({
        chgNumber: this.newChange.chgNumber,
        status: this.newChange.status,
        startDate: this.newChange.startDate,
        endDate: this.newChange.endDate,
        notes: this.newChange.notes
      });

      try {
        await this.debouncedUpdatePageDetails(this.currentPage);
        this.$socket.emit('editPage', this.currentPage);
        this.resetNewChange();
        
      } catch (error) {
        console.error('Error saving change:', error);
        this.addToast({ message: 'Error saving change:', type: 'danger' });
      }
    },
    resetNewChange() {
      this.newChange = {
        client: '',
        chgNumber: '',
        status: 'Active',
        startDate: '',
        endDate: '',
        notes: ''
      };
    },
    //--Request addition--
    async saveRequest() {
      const client = this.currentPage.clients[this.newRequest.client];
      client.serviceRequests.push({
        ritmNumber: this.newRequest.ritmNumber,
        status: this.newRequest.status,
        desc: this.newRequest.desc,
        notes: this.newRequest.notes
      });

      try {
        await this.debouncedUpdatePageDetails(this.currentPage);
        this.$socket.emit('editPage', this.currentPage);
        this.resetNewRequest();
        
      } catch (error) {
        console.error('Error saving service request:', error);
        this.addToast({ message: 'Error saving service request:', type: 'danger' });
      }
    },
    resetNewRequest() {
      this.newRequest = {
        client: '',
        ritmNumber: '',
        status: 'Draft',
        desc: '',
        notes: ''
      };
    },
    async removePage() {
      if (confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
        try {
          await this.deletePage(this.currentPage.id);
          this.$socket.emit('deletePage', { id: this.currentPage.id }); // Emit event to notify others
          
          this.$router.push({ name: 'HomePage' }); // Redirect or handle the navigation
        } catch (error) {
          console.error('Failed to delete the page:', error);
          this.addToast({ message: `Failed to delete the page: ${error.message}`, type: 'danger' });
        }
      }
    },
    handlePageUpdated(data) {
      console.log('Page updated event received:', data);
      if (this.currentPage && this.currentPage.id === data.id) {
        console.log('Updating current page:', data);
        this.setCurrentPage(data);
      }
    },
  },
  created() {
    const docId = this.$route.params.id;
    this.fetchShifts();
    if (docId) {
      this.fetchPageDetails(docId);
    } else {
      console.error("Page ID is undefined.");
    }
    this.$socket.on('pageUpdated', this.handlePageUpdated);
  },
  beforeUnmount() {
    this.$socket.off('pageUpdated', this.handlePageUpdated);
  }
};
</script>

<style scoped>
.main-container {
  display: block;
  width: 100%;
  max-height: calc(100vh - 70px);  /* Adjust the height by subtracting the height of your navbar */
  overflow-y: auto;  /* Enables vertical scrolling inside the main-container */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;  /* Makes the header sticky */
  top: 0;  /* Stick to the top of the main-container */
  background: white;  /* Background color to ensure text is readable */
  z-index: 10;  /* Higher index to keep it above other content */
}

.bi-three-dots-vertical, .bi-plus-lg {
  color: rgb(0, 0, 0);
}

#remove-btn, #remove-btn-mod {
  color: red;
  background: white;
}

.dropwdowns-opt {
  display: flex;
  color: rgb(0, 0, 0);
  gap: 10px;  /* Maintain spacing between buttons */
}

.dropwdowns-opt.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.table-fixed {
  width: 100%;
  table-layout: fixed;
}

.table-fixed th, .table-fixed td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;  /* Ensures no text wrap in table cells */
}

.table-fixed th:last-child, .table-fixed td:last-child {
  white-space: normal;  /* Allows text wrapping in the last column */
}

.table-fixed th.main-problem, .table-fixed td.main-problem,
.table-fixed th.short-request-description, .table-fixed td.short-request-description {
  white-space: normal; /* Allows text wrapping */
  word-wrap: break-word; /* Wraps long words */
  overflow: visible; /* Ensures the full text is visible */
}

.custom-textarea {
  width: 100%;
  height: auto;
  resize: both;  /* Allows resizing */
  font-size: 1rem;
  padding: 0.5rem;
  white-space: pre-wrap;  /* Maintains white space formatting */
  word-wrap: break-word;  /* Wraps long words */
}
</style>
