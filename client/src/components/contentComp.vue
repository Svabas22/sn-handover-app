<template>
  <div id="content-container" class="container mt-4">
    <div v-if="currentPage" class="main-container">
      <div class="header">
        <h1>{{ currentPage.title }}</h1>
        <p class="text-muted fst-italic" style="margin-top: 20px;">Last edited by: {{ currentPage.lastEditedBy }}</p>
        <div :class="{'dropwdowns-opt': true}">
          <div :class="{'dropdown-add': true, 'disabled': !isEngineer}">
            <button class="btn btn-link text-decoration-none" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" :disabled="!isEngineer">
              <i class="bi bi-plus-lg"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
              <li><a class="dropdown-item" id="add-inc-btn" href="#" data-bs-toggle="modal" data-bs-target="#addIncidentModal">Add Incident</a></li>
              <li><a class="dropdown-item" id="add-prb-btn" href="#" data-bs-toggle="modal" data-bs-target="#addProblemModal">Add Problem</a></li>
              <li><a class="dropdown-item" id="add-chg-btn" href="#" data-bs-toggle="modal" data-bs-target="#addChangeModal">Add Change</a></li>
              <li><a class="dropdown-item" id="add-req-btn" href="#" data-bs-toggle="modal" data-bs-target="#addRequestModal">Add Service Request</a></li>
            </ul>
          </div>
          <div :class="{'dropdown-import': true, 'disabled': !isEngineer}">
            <button class="btn btn-link text-decoration-none" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-upload"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
              <li><a class="dropdown-item" id="add-inc-btn" href="#" data-bs-toggle="modal" data-bs-target="#importIncidentsModal">Import Incidents</a></li>
              <li><a class="dropdown-item" id="add-prb-btn" href="#" data-bs-toggle="modal" data-bs-target="#importProblemsModal">Import Problems</a></li>
              <li><a class="dropdown-item" id="add-chg-btn" href="#" data-bs-toggle="modal" data-bs-target="#importChangesModal">Import Changes</a></li>
              <li><a class="dropdown-item" id="add-req-btn" href="#" data-bs-toggle="modal" data-bs-target="#importReqModal">Import Service Requests</a></li>
            </ul>
          </div>
          <div class="dropdown">
            <button class="btn btn-link text-decoration-none" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
              <li>
                <a :class="{ 'dropdown-item': true, 'disabled': !isEngineer || (isLocked && !editMode) }"
                  @click="toggleEditMode">
                  {{ editMode ? 'Save' : 'Edit' }}
                </a>
              </li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li>
                <a
                  id="remove-btn"
                  href="#"
                  :class="{ 'dropdown-item': true, 'disabled': !isEngineer || editMode }"
                  data-bs-toggle="modal"
                  data-bs-target="#removePageModal"
                >
                  Remove page
                </a>
              </li>
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
                    <option v-for="client in clients" :value="client.id" :key="client.id">
                      {{ client.client }}
                    </option>
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

      <!-- Import Incident Modal -->
      <div class="modal fade" id="importIncidentsModal" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="importModalLabel">Import Incidents</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="clientNameInput" class="form-label">Client Name</label>
              <select v-model="selectedClient" id="clientSelect" class="form-select">
                <option v-for="client in clients" :key="client.id" :value="client.client">
                  {{ client.client }}
                </option>
              </select>
            </div>
            <input type="file" @change="handleFileUpload" accept=".json" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="importIncidentRecords">Import</button>
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
                    <option>Client1</option>
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
                  <label for="rca" class="form-label">Root cause analysis summary</label>
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

      <!-- Import Problems Modal -->
      <div class="modal fade" id="importProblemsModal" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="importModalLabel">Import Problems</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="clientNameInput" class="form-label">Client Name</label>
              <select v-model="selectedClient" id="clientSelect" class="form-select">
                <option v-for="client in clients" :key="client.id" :value="client.client">
                  {{ client.client }}
                </option>
              </select>
            </div>
            <input type="file" @change="handleFileUpload" accept=".json" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="importProblemRecords">Import</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Changes Modal -->
    <div class="modal fade" id="importChangesModal" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="importModalLabel">Import Changes</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="clientNameInput" class="form-label">Client Name</label>
              <select v-model="selectedClient" id="clientSelect" class="form-select">
                <option v-for="client in clients" :key="client.id" :value="client.client">
                  {{ client.client }}
                </option>
              </select>
            </div>
            <input type="file" @change="handleFileUpload" accept=".json" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="importChangeRecords">Import</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Request Modal -->
    <div class="modal fade" id="importReqModal" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="importModalLabel">Import Changes</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="clientNameInput" class="form-label">Client Name</label>
              <select v-model="selectedClient" id="clientSelect" class="form-select">
                <option v-for="client in clients" :key="client.id" :value="client.client">
                  {{ client.client }}
                </option>
              </select>
            </div>
            <input type="file" @change="handleFileUpload" accept=".json" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="importRequestRecords">Import</button>
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
                    <option>Client1</option>
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
                    <option>Client1</option>
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
                  <textarea class="form-control" id="notes" v-model="newRequest.short_description" rows="3" required></textarea>
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
              <button type="button" class="btn btn-primary" id="liveToastBtn" @click="removePage" data-bs-dismiss="modal">Remove</button>
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
      <div v-if="currentPage.records && currentPage.records.incidents.length > 0">
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
            <tr v-for="incident in currentPage.records.incidents" :key="incident.incNumber" required>
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
      <div v-if="currentPage.records && currentPage.records.problems.length > 0">
        <h6>Problems</h6>
        <table class="table table-fixed">
          <thead>
            <tr>
              <th>Problem Number</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Root cause analysis summary</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="problem in currentPage.records.problems" :key="problem.prbNumber" required>
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

      <div v-if="currentPage.records && currentPage.records.changes.length > 0">
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
            <tr v-for="change in currentPage.records.changes" :key="change.chgNumber" required>
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

      <div v-if="currentPage.records && currentPage.records.serviceRequests.length > 0">
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
            <tr v-for="request in currentPage.records.serviceRequests" :key="request.ritmNumber" required>
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
                <div v-if="!editMode">{{ request.short_description }}</div>
                <div v-else>
                  <textarea type="text" v-model="request.short_description" class="form-control custom-textarea" required></textarea>
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
    <div v-else>No data available</div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      editMode: false,
      userProfile: { role: localStorage.getItem('roles'), name: localStorage.getItem('user') },
      originalPageState: null,
      usersOnPage: [],
      currentImportType: '',
      lastEditedBy: '',
      jsonData: null,
      selectedClient: '',
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
        short_description: '',
        notes: ''
      }
    };
  },
  computed: {
    ...mapState(['clients', 'currentPage', 'pages', 'shifts', 'currentShift', 'toasts', 'usersOnPage']),
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
    },
    isLocked() {
      return this.$store.state.isPageLocked && this.$store.state.lockedPageId === this.currentPage.id;
    },

  },
  methods: {
    ...mapActions(['fetchPageDetails', 'debouncedUpdatePageDetails', 'deletePage', 'addToast', 'fetchClients' ,'fetchPages', 'setPages', 'setCurrentPage', 'fetchShifts', 'fetchShiftDetails']),
    async toggleEditMode() {

      if (this.editMode) {
        if (this.hasChanges()) {
          await this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
        }
        await this.$store.dispatch('debouncedUnlockEditMode', { pageId: this.currentPage.id, pageTitle: this.currentPage.title, userName: this.userProfile.name });
      } else {
        if (!this.isLocked) {
          await this.$store.dispatch('debouncedLockEditMode', { pageId: this.currentPage.id, pageTitle: this.currentPage.title, userName: this.userProfile.name });
        }
      }
      this.editMode = !this.editMode;
    },
    hasChanges() {
      return JSON.stringify(this.currentPage) !== this.originalPageState;
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

    //--Import file--
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            this.jsonData = JSON.parse(e.target.result);
          } catch (error) {
            console.error('Invalid JSON format:', error);
            this.addToast({ message: 'Invalid JSON file format', type: 'danger' });
          }
        };
        reader.readAsText(file);
      }
    },


    //--INC addition--
    async saveIncident() {

      if (!this.currentPage.records) {
        this.currentPage.records = {};
      }

      if (!this.currentPage.records.incidents) {
        this.currentPage.records.incidents = [];
      }

      const newIncident = {
        client: this.newIncident.client,
        incNumber: this.newIncident.incNumber,
        status: this.newIncident.status,
        dateOpened: this.newIncident.dateOpened,
        priority: this.newIncident.priority,
        mainProblem: this.newIncident.mainProblem,
        notes: this.newIncident.notes
      };
      this.currentPage.records.incidents.push(newIncident);

      try {
        await this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
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

    recordExists(recordsArray, identifier, value) {
      return recordsArray.some(record => record[identifier] === value);
    },

    // Helper function to map numeric priority to string
    getPriorityLabel(priority) {
      switch (parseInt(priority)) {
        case 4:
          return "P4 - Low";
        case 3:
          return "P3 - moderate";
        case 2:
          return "P2 - high";
        case 1:
          return "P1 - Critical";
        default:
          return "";
      }
    },

    //Incident state mapping
    mapIncidentState(state) {
      switch (parseInt(state)) {
        case 8:
          return "Cancelled";
        case 7:
          return "Closed";
        case 6:
          return "Resolved";
        case 5:
          return "Awaiting Third Party";
        case 4:
          return "Awaiting User Info";
        case 2:
          return "Active";
        case 1:
          return "New";
        default:
          return "";
      }
    },

    //--Import incidents--
    async importIncidentRecords() {
      if (!this.jsonData) {
        this.addToast({ message: 'No file uploaded', type: 'danger' });
        return;
      }

      if (!this.selectedClient) {
        this.addToast({ message: 'Client selection is required', type: 'danger' });
        return;
      }

      try {
        console.log('Importing incidents:', this.jsonData);

        this.jsonData.records.forEach(record => {
          const newIncident = {
            client: this.selectedClient,
            incNumber: record.number || '',
            status: this.mapIncidentState(record.incident_state),
            dateOpened: record.opened_at || '',
            priority: this.getPriorityLabel(record.priority),
            mainProblem: record.short_description || 'No description',
            notes: 'Test note',
          };

          const existingIncident = this.currentPage.records.incidents.find(
            incident => incident.incNumber === newIncident.incNumber
          );

          if (existingIncident) {
            // Update existing incident
            Object.assign(existingIncident, newIncident);
          } else {
            // Add new incident
            this.currentPage.records.incidents.push(newIncident);
          }
        });

        await this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
        this.addToast({ message: `Incidents imported successfully`, type: 'success' });

        this.jsonData = null;
        this.clientName = '';
        this.currentImportType = '';
      } catch (error) {
        console.error('Error importing incidents:', error);
        this.addToast({ message: 'Error importing incidents', type: 'danger' });
      }
    },

    
    
    //--Import problems--
    async importProblemRecords() {
      if (!this.jsonData) {
        this.addToast({ message: 'No file uploaded', type: 'danger' });
        return;
      }

      if (!this.selectedClient) {
        this.addToast({ message: 'Client selection is required', type: 'danger' });
        return;
      }

      try {
        console.log('Importing problems:', this.jsonData);

        this.jsonData.records.forEach(record => {
          const newProblem = {
            client: this.selectedClient,
            prbNumber: record.number || '',
            status: 'Evaluate',
            priority: this.getPriorityLabel(record.priority),
            rca: record.short_description || '',
            notes: 'Test note',
          };

          const existingProblem = this.currentPage.records.problems.find(
            problem => problem.prbNumber === newProblem.prbNumber
          );

          if (existingProblem) {
            // Update existing problem
            Object.assign(existingProblem, newProblem);
          } else {
            // Add new problem
            this.currentPage.records.problems.push(newProblem);
          }
        });

        await this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
        this.addToast({ message: `Problems imported successfully`, type: 'success' });

        this.jsonData = null;
        this.clientName = '';
        this.currentImportType = '';
      } catch (error) {
        console.error('Error importing problems:', error);
        this.addToast({ message: 'Error importing problems', type: 'danger' });
      }
    },
    //--Import changes--
    async importChangeRecords() {
      if (!this.jsonData) {
        this.addToast({ message: 'No file uploaded', type: 'danger' });
        return;
      }

      if (!this.selectedClient) {
        this.addToast({ message: 'Client selection is required', type: 'danger' });
        return;
      }

      try {
        console.log('Importing changes:', this.jsonData);

        this.jsonData.records.forEach(record => {
          const newChange = {
            client: this.selectedClient,
            chgNumber: record.number || '',
            status: 'Authorize',
            startDate: record.start_date || '',
            endDate: record.end_date || '',
            notes: record.short_description || ''
          };

          const existingChange = this.currentPage.records.changes.find(
            change => change.chgNumber === newChange.chgNumber
          );

          if (existingChange) {
            // Update existing change
            Object.assign(existingChange, newChange);
          } else {
            // Add new change
            this.currentPage.records.changes.push(newChange);
          }
        });

        await this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
        this.addToast({ message: `Changes imported successfully`, type: 'success' });

        this.jsonData = null;
        this.clientName = '';
        this.currentImportType = '';
      } catch (error) {
        console.error('Error importing changes:', error);
        this.addToast({ message: 'Error importing changes', type: 'danger' });
      }
    },
    //--Import Service Requests--
    async importRequestRecords() {
      if (!this.jsonData) {
        this.addToast({ message: 'No file uploaded', type: 'danger' });
        return;
      }

      if (!this.selectedClient) {
        this.addToast({ message: 'Client selection is required', type: 'danger' });
        return;
      }

      try {
        console.log('Importing service requests:', this.jsonData);

        this.jsonData.records.forEach(record => {
          const newRequest = {
            client: this.selectedClient,
            ritmNumber: record.number || '',
            status: 'Draft',
            short_description: record.short_description || '',
            notes: ''
          };

          const existingRequest = this.currentPage.records.serviceRequests.find(
            request => request.ritmNumber === newRequest.ritmNumber
          );

          if (existingRequest) {
            // Update existing request
            Object.assign(existingRequest, newRequest);
          } else {
            // Add new request
            this.currentPage.records.serviceRequests.push(newRequest);
          }
        });

        await this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
        this.addToast({ message: `Service requests imported successfully`, type: 'success' });

        this.jsonData = null;
        this.clientName = '';
        this.currentImportType = '';
      } catch (error) {
        console.error('Error importing service requests:', error);
        this.addToast({ message: 'Error importing service requests', type: 'danger' });
      }
    },


    //--Problem addition--
    async saveProblem() {
      const newProblem = {
        client: this.newProblem.client,
        prbNumber: this.newProblem.prbNumber,
        status: this.newProblem.status,
        priority: this.newProblem.priority,
        rca: this.newProblem.rca,
        notes: this.newProblem.notes
      };
      
      this.currentPage.records.problems.push(newProblem);

      try {
        await this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
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
      const newChange = {
        client: this.newChange.client,
        chgNumber: this.newChange.chgNumber,
        status: this.newChange.status,
        startDate: this.newChange.startDate,
        endDate: this.newChange.endDate,
        notes: this.newChange.notes
      };

      this.currentPage.records.changes.push(newChange);

      try {
        await this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
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
      const newRequest = {
        client: this.newRequest.client, 
        ritmNumber: this.newRequest.ritmNumber,
        status: this.newRequest.status,
        short_description: this.newRequest.short_description,
        notes: this.newRequest.notes
      };

      this.currentPage.records.serviceRequests.push(newRequest);

      try {
        await this.debouncedUpdatePageDetails({ page: this.currentPage, source: this.$socket.id });
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
        short_description: '',
        notes: ''
      };
    },
    async removePage() {
      const pageId = this.currentPage.id;
      const pageTitle = this.currentPage.title;
      console.log('Removing page:', pageId);

      if (!pageId) {
        console.error('Page ID is undefined.');
        this.addToast({ message: 'Failed to delete page: Page ID is undefined.', type: 'danger' });
        return;
      }
      
      const otherUsers = this.usersOnPage.filter(user => user.socketId !== this.$socket.id);
      console.log("Other users on page:", this.usersOnPage);
      if (!confirm(`Are you sure you want to delete "${pageTitle}"? This action cannot be undone.`)) {
        return;
      }

      if (otherUsers.length > 0) {
        const usernames = otherUsers.map(user => user.username || 'another user').join(', ');
        const confirmMessage = `Other users (${usernames}) are also viewing this page. Are you sure you want to delete it?`;

        if (!confirm(confirmMessage)) {
          return;
        }
      }

      try {
        const response = await fetch(`/api/records/${pageId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete page');
        }

        this.$socket.emit('deletePage', { id: pageId, title: pageTitle, pageId });
        this.$router.push({ name: 'HomePage' });
      } catch (error) {
        this.addToast({ message: `Failed to delete page: ${error.message}`, type: 'danger' });
      }
    },
    handlePageUpdated(data) {
      console.log('Page updated event received:', data);

      if (this.currentPage && this.currentPage.id === data.id) {
        if (this.currentPage.version !== data.version) {
          console.log('Version conflict detected.');
          if (confirm("This page has been updated by another user. Would you like to reload the latest version?")) {
            this.fetchPageDetails(data.id);
          } else {
            this.addToast({ message: 'You are viewing an outdated version of the page.', type: 'warning' });
          }
        } else {
          this.setCurrentPage(data);
          console.log('Current page updated without conflict.');
        }
      }
    }
  },
  created() {

    const docId = this.$route.params.id;
    this.fetchShifts();
    this.fetchClients();
    const userName = localStorage.getItem('userName');
    console.log('DOC ID', docId);
    if (docId) {
      this.fetchPageDetails(docId);
      this.$socket.emit('viewPage', { pageId: docId, userName: userName });
    } else {
      console.error("Page ID is undefined.");
    }
    this.$socket.on('usersOnPage', (users) => {
      console.log('Users on page:', users);
      this.$store.commit('setUsersOnPage', users);
    });
    this.$socket.on('connect', () => {
      this.socketId = this.$socket.id;
    });
    

  },
  beforeUnmount() {

    this.$socket.off('usersOnPage');
    this.$socket.off('pageDeleted');
    this.$socket.emit('leavePage', { pageId: this.currentPage.id });
  }

};
</script>


<style scoped>
.main-container {
  display: block;
  width: 100%;
  max-height: calc(100vh - 70px);
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.bi-three-dots-vertical, .bi-plus-lg, .bi-upload {
  color: rgb(0, 0, 0);
}

#remove-btn, #remove-btn-mod {
  color: red;
  background: white;
}

.dropwdowns-opt {
  display: flex;
  color: rgb(0, 0, 0);
  gap: 10px;
}

.dropwdowns-opt.disabled, 
.dropdown-import.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.dropdown-item.disabled {
  pointer-events: none;
  color: #6c757d !important;
  background-color: #e9ecef;
}

.table-fixed {
  width: 100%;
  table-layout: fixed;
}

.table-fixed th, .table-fixed td {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table-fixed th:last-child, .table-fixed td:last-child {
  white-space: normal;
}

.table-fixed th.main-problem, .table-fixed td.main-problem,
.table-fixed th.short-request-description, .table-fixed td.short-request-description {
  white-space: normal;
  word-wrap: break-word;
  overflow: visible;
}

.custom-textarea {
  width: 100%;
  height: auto;
  resize: both;
  font-size: 1rem;
  padding: 0.5rem;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
