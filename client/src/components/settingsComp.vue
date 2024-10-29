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
          <label for="client-select" class="form-label">Select Client</label>
          <select v-model="selectedClientId" @change="fetchSLAQuotas" id="client-select" class="form-select">
            <option v-for="client in clients" :value="client.id" :key="client.id">
              {{ client.client }}
            </option>
          </select>

          <!-- SLA Quotas Form -->
          <div v-if="slaQuotas">
            <div class="mt-3">
              <label for="quotaP1" class="form-label">P1 Quota (Critical)</label>
              <input v-model="slaQuotas.quota_P1" type="number" class="form-control" id="quotaP1" />
            </div>
            <div class="mt-3">
              <label for="quotaP2" class="form-label">P2 Quota (High)</label>
              <input v-model="slaQuotas.quota_P2" type="number" class="form-control" id="quotaP2" />
            </div>
            <div class="mt-3">
              <label for="quotaP3" class="form-label">P3 Quota (Moderate)</label>
              <input v-model="slaQuotas.quota_P3" type="number" class="form-control" id="quotaP3" />
            </div>
            <div class="mt-3">
              <label for="quotaP4" class="form-label">P4 Quota (Low)</label>
              <input v-model="slaQuotas.quota_P4" type="number" class="form-control" id="quotaP4" />
            </div>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="saveChanges">Save changes</button>
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
      slaQuotas: { quota_P1: '', quota_P2: '', quota_P3: '', quota_P4: '' },
    };
  },
  computed: {
    ...mapState(['clients']), 
  },
  methods: {
    ...mapActions(['fetchClientSLAQuotas', 'updateClientSLAQuotas', 'addToast']),

    openSettingsModal() {
      const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
      modal.show();
    },

    async fetchSLAQuotas() {
      try {
        const clientSLAData = await this.$store.dispatch('fetchClientSLAQuotas', this.selectedClientId);
        if (clientSLAData) {
          this.slaQuotas = clientSLAData.slaQuotas;
          console.log('SLA Quotas fetched:', this.slaQuotas); // Debugging log
        }
      } catch (error) {
        this.addToast({ message: 'Failed to fetch SLA Quotas', type: 'error' });
      }
    },

    async saveChanges() {
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
  },

  mounted() {
    this.$store.dispatch('fetchClients');
  },
};
</script>

<style scoped>
</style>
