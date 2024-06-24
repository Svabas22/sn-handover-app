<template>
  <div>
    <div class="modal fade" id="slaProgressModal" tabindex="-1" aria-labelledby="slaProgressModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="slaProgressModalLabel">Incident SLA Progress</h5>
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
                          :style="{ width: calculateSLAProgress(incident) + '%' }"
                          :class="slaProgressClass(incident)"
                          role="progressbar"
                          :aria-valuenow="calculateSLAProgress(incident)"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {{ calculateSLAProgress(incident) }}%
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
    };
  },
  methods: {
    ...mapActions(['fetchLatestPage']),
    async openSlaModal() {
      const latestPage = await this.fetchLatestPage();
      const incidentsByClient = {};

      Object.entries(latestPage.clients).forEach(([clientName, client]) => {
        const incidents = client.incidents.filter(incident => incident.status !== 'Resolved');
        if (incidents.length > 0) {
          incidentsByClient[clientName] = incidents;
        }
      });

      this.groupedIncidents = incidentsByClient;
      const modal = new bootstrap.Modal(document.getElementById('slaProgressModal'));
      modal.show();
    },
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    calculateSLAProgress(incident) {
      const priorities = {
        'P1 - Critical': 3 * 60,
        'P2 - High': 8 * 60,
        'P3 - Moderate': 24 * 60,
        'P4 - Low': 40 * 60
      };
      const openDate = new Date(incident.dateOpened);
      const currentDate = new Date();
      const elapsedTime = (currentDate - openDate) / (1000 * 60);
      const slaTime = priorities[incident.priority] || 0;
      const progress = Math.min((elapsedTime / slaTime) * 100, 100);
      return progress.toFixed(2);
    },
    slaProgressClass(incident) {
      const progress = this.calculateSLAProgress(incident);
      return {
        'bg-success': progress <= 75,
        'bg-warning': progress > 50 && progress <= 90,
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
