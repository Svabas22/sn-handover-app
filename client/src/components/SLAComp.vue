<template>
  <div>
    <div class="modal fade" id="slaProgressModal" tabindex="-1" aria-labelledby="slaProgressModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="slaProgressModalLabel">SLA Progress</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-for="(incidents, clientName) in groupedIncidents" :key="clientName">
              <h5>{{ clientName }}</h5>
              <table class="table">
                <thead>
                  <tr>
                    <th>Incident Number</th>
                    <th>Status</th>
                    <th>Date Opened</th>
                    <th>Priority</th>
                    <th>SLA Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="incident in incidents" :key="incident.incNumber">
                    <td>{{ incident.incNumber }}</td>
                    <td>{{ incident.status }}</td>
                    <td>{{ formatDate(incident.dateOpened) }}</td>
                    <td>{{ incident.priority }}</td>
                    <td>
                      <div class="progress">
                        <div
                          class="progress-bar"
                          :style="{ width: calculateSLAProgress(incident, clientName) + '%' }"
                          :class="slaProgressClass(incident, clientName)"
                          role="progressbar"
                          :aria-valuenow="calculateSLAProgress(incident, clientName)"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {{ calculateSLAProgress(incident, clientName) }}%
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';

export default {
  name: 'SLAProgressModal',
  data() {
    return {
      groupedIncidents: {},
      slaQuotasByClient: {}
    };
  },
  methods: {
    ...mapActions(['fetchLatestPage', 'fetchClientSLAQuotas']),
    async openSlaModal() {
      const latestPage = await this.fetchLatestPage();
      const incidentsByClient = {};
      const slaQuotaPromises = [];

      latestPage.records.incidents.forEach(incident => {
        if (incident.status !== 'Resolved') {
          if (!incidentsByClient[incident.client]) {
            incidentsByClient[incident.client] = [];
            slaQuotaPromises.push(this.loadClientSLAQuotas(incident.client));
          }
          incidentsByClient[incident.client].push(incident);
        }
      });

      await Promise.all(slaQuotaPromises);
      this.groupedIncidents = incidentsByClient;
      const modal = new bootstrap.Modal(document.getElementById('slaProgressModal'));
      modal.show();
    },
    async loadClientSLAQuotas(clientName) {
      const clientId = this.$store.state.clientNameToIdMap[clientName];
      
      if (clientId && !this.slaQuotasByClient[clientName]) {
        const clientData = await this.fetchClientSLAQuotas(clientId); 
        if (clientData && clientData.slaQuotas) {
          this.slaQuotasByClient[clientName] = clientData.slaQuotas;
        } else {
          this.slaQuotasByClient[clientName] = {
            quota_P1: 180,
            quota_P2: 480,
            quota_P3: 1440,
            quota_P4: 2400
          };
        }
      }
    },

    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    calculateSLAProgress(incident, clientName) {
      const slaQuotas = this.slaQuotasByClient[clientName] || {};
      const priorityMapping = {
        'P1 - Critical': slaQuotas.quota_P1,
        'P2 - high': slaQuotas.quota_P2,
        'P3 - moderate': slaQuotas.quota_P3,
        'P4 - Low': slaQuotas.quota_P4
      };
      
      const slaTime = priorityMapping[incident.priority] || 0;

      const openDate = new Date(incident.dateOpened);
      const currentDate = new Date();
      const elapsedTime = (currentDate - openDate) / (1000 * 60);
      const progress = Math.min((elapsedTime / slaTime) * 100, 100);
      
      return progress.toFixed(2);
    },
    slaProgressClass(incident, clientName) {
      const progress = this.calculateSLAProgress(incident, clientName);
      return {
        'bg-success': progress <= 75,
        'bg-warning': progress > 75 && progress <= 90,
        'bg-danger': progress > 90
      };
    }
  }
};
</script>

<style scoped>
.progress-bar {
  transition: width 0.6s ease;
}
</style>
