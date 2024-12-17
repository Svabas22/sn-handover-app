<template>
  <div class="modal fade" id="settingsModal" tabindex="-1" aria-labelledby="settingsModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="settingsModalLabel">Settings</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Client Dropdown -->
          <div class="edit-sla-quotas">
            <h5>Edit SLA Quotas</h5>
            <hr />
            <label for="client-select" class="form-label">Select Client</label>
            <select v-model="selectedClientId" @change="fetchSLAQuotas" id="client-select" class="form-select">
              <option v-for="client in clients" :value="client.id" :key="client.id">
                {{ client.client }}
              </option>
              
            </select>

            <!-- SLA Quotas Form -->
            <div v-if="slaQuotas">
              <form @submit.prevent="saveSlaChanges">
                <div class="mt-3">
                  <label for="quotaP1" class="form-label">P1 Quota (Critical)</label>
                  <input v-model="slaQuotas.quota_P1" type="number" class="form-control" id="quotaP1" :disabled="isEngineer" required/>
                </div>
                <div class="mt-3">
                  <label for="quotaP2" class="form-label">P2 Quota (High)</label>
                  <input v-model="slaQuotas.quota_P2" type="number" class="form-control" id="quotaP2" :disabled="isEngineer" required/>
                </div>
                <div class="mt-3">
                  <label for="quotaP3" class="form-label">P3 Quota (Moderate)</label>
                  <input v-model="slaQuotas.quota_P3" type="number" class="form-control" id="quotaP3" :disabled="isEngineer" required/>
                </div>
                <div class="mt-3">
                  <label for="quotaP4" class="form-label">P4 Quota (Low)</label>
                  <input v-model="slaQuotas.quota_P4" type="number" class="form-control" id="quotaP4" :disabled="isEngineer" required/>
                </div>
                <button type="submit" class="btn btn-primary mt-3">Save SLA changes</button>
              </form>
            </div>

            <hr />
            <!-- End of SLA Quotas Form -->

            <!-- New Client Form -->
            <div v-if="!isEngineer">
              <h5>Add New Client</h5>
              <hr />
              <form @submit.prevent="saveNewClient">
                <label for="newClientName" class="form-label">Client Name</label>
                <input v-model="newClientName" type="text" class="form-control" id="newClientName" placeholder="Enter new client name" required />

                <div class="mt-3">
                  <label for="newQuotaP1" class="form-label">P1 Quota (Critical)</label>
                  <input v-model="newClientQuotas.quota_P1" type="number" class="form-control" id="newQuotaP1" required />
                </div>
                <div class="mt-3">  
                  <label for="newQuotaP2" class="form-label">P2 Quota (High)</label>
                  <input v-model="newClientQuotas.quota_P2" type="number" class="form-control" id="newQuotaP2" required />
                </div>
                <div class="mt-3">
                  <label for="newQuotaP3" class="form-label">P3 Quota (Moderate)</label>
                  <input v-model="newClientQuotas.quota_P3" type="number" class="form-control" id="newQuotaP3" required />
                </div>
                <div class="mt-3">
                  <label for="newQuotaP4" class="form-label">P4 Quota (Low)</label>
                  <input v-model="newClientQuotas.quota_P4" type="number" class="form-control" id="newQuotaP4" required />
                </div>
                <button type="submit" class="btn btn-primary mt-3">Save New Client</button>
              </form>
            </div>
            <hr />

          </div>
          <!-- End of Editing SLA Quotas Form -->

          <!-- Shifts Form -->
          <div class="edit-shift">
            <h5>Edit Shift details</h5>
            <hr />
            <label for="shift-select" class="form-label">Select Shift</label>
            <select v-model="selectedShiftId" @change="fetchShiftDetails" id="shift-select" class="form-select">
              <option v-for="shift in shifts" :value="shift.id" :key="shift.id">
                {{ shift.title }}
              </option>
            </select>

            <!-- Engineer Names Form -->
            <div v-if="currentShift && currentShift.engineers.length">
              <form @submit.prevent="saveShiftChanges">
                <div v-for="(engineer, index) in currentShift.engineers.slice(0, 4)" :key="index" class="mt-3">
                  <label :for="'engineer-' + index" class="form-label">Engineer {{ index + 1 }} name</label>
                  <input v-model="engineer.name" type="text" class="form-control" :id="'engineer-' + index" placeholder="Enter engineer name" :disabled="isEngineer" />
                </div>
                <button type="submit" class="btn btn-primary mt-3">Save Shift Changes</button>
              </form>
            </div>
          </div>

          <div class="function-control">
            <h5>Azure Function Control</h5>
            <hr />
            <!-- Toggle Button -->
            <button
              @click="toggleFunctionState"
              :class="functionDisabled ? 'btn btn-danger' : 'btn btn-success'"
            >
              {{ functionDisabled ? 'Enable Function' : 'Disable Function' }}
            </button>
            <p class="mt-2">
              Status: <strong>{{ functionDisabled ? 'Disabled' : 'Enabled' }}</strong>
            </p>
          </div>

          <hr />
        </div>
          <hr />
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          
        </div>
      </div>  
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';

export default {
  data() {
    return {
      selectedClientId: null,
      selectedShiftId: null,
      currentShift: { title: '', engineers: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }] },
      slaQuotas: { quota_P1: '', quota_P2: '', quota_P3: '', quota_P4: '' },
      newClientName: '',
      newClientQuotas: { quota_P1: '', quota_P2: '', quota_P3: '', quota_P4: '' },
      userProfile: { role: localStorage.getItem('roles') },
      functionDisabled: false
    };
  },
  computed: {
    ...mapState(['clients']),
    ...mapState(['shifts']),
    isEngineer() {
      return this.userProfile.role === 'Engineer';
    }
  },
  methods: {
    ...mapActions(['fetchClientSLAQuotas', 'updateClientSLAQuotas', 'fetchShifts', 'fetchShiftDetails', 'updateShiftDetails', 'addToast']),
    openSettingsModal() {
      const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
      modal.show();
    },
    async toggleFunctionState() {
      try {
        const newState = !this.functionDisabled;
        const endpoint = '/api/disable-function';

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ disable: newState }),
        });

        this.functionDisabled = newState;
        this.addToast({
          message: `Azure Function successfully ${newState ? 'disabled' : 'enabled'}`,
          type: 'success',
        });
      } catch (error) {
        console.error('Error toggling Azure Function:', error);
        this.addToast({ message: 'Failed to toggle Azure Function', type: 'danger' });
      }
    },
    async fetchSLAQuotas() {
      try {
        const clientSLAData = await this.$store.dispatch('fetchClientSLAQuotas', this.selectedClientId);
        if (clientSLAData) {
          this.slaQuotas = clientSLAData.slaQuotas;
          console.log('SLA Quotas fetched:', this.slaQuotas);
        }
      } catch (error) {
        this.addToast({ message: 'Failed to fetch SLA Quotas', type: 'danger' });
      }
    },

    async saveSlaChanges() {
      try{
        await this.$store.dispatch('updateClientSLAQuotas', {
          clientId: this.selectedClientId,
          slaQuotas: this.slaQuotas
        });
        this.addToast({ message: 'SLA Quotas updated successfully', type: 'success' });
      } catch (error) {
        this.addToast({ message: 'Failed to update SLA Quotas', type: 'error' });
      }
    },
    async fetchShiftDetails() {
      try {
        const shiftData = await this.$store.dispatch('fetchShiftDetails', this.selectedShiftId);
        this.currentShift = shiftData || { title: '', engineers: [{ name: '' }, { name: '' }, { name: '' }, { name: '' }] };
      } catch (error) {
        this.addToast({ message: 'Failed to fetch shift details', type: 'danger' });
      }
    },

    async saveShiftChanges() {
      try {
        await this.$store.dispatch('updateShiftDetails', this.currentShift);
        this.addToast({ message: 'Shift updated successfully', type: 'success' });
      } catch (error) {
        this.addToast({ message: 'Failed to update shift', type: 'danger' });
      }
    },

    async saveNewClient() {
      if (!this.newClientName) {
        this.addToast({ message: 'Client name is required', type: 'danger' });
        return;
      }

      try {
        const newClient = {
          client: this.newClientName,
          slaQuotas: this.newClientQuotas,
        };

        await this.$store.dispatch('createNewClient', newClient);
        this.newClientName = '';
        this.newClientQuotas = { quota_P1: '', quota_P2: '', quota_P3: '', quota_P4: '' };


        this.fetchClients();
      } catch (error) {
        
        console.error('Error adding new client:', error);
        this.addToast({ message: 'Failed to add new client', type: 'danger' });
      }
    }
  },

  mounted() {
    this.$store.dispatch('fetchClients');
    this.$store.dispatch('fetchShifts');
    this.functionDisabled = false;
  },
};
</script>

<style scoped>
button {
  width: 150px;
}
</style>
