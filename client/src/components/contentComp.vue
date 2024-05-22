// contentComp.vue
<template>
  <div id="content-container" class="container mt-4">
    <div v-if="currentPage" class="main-container">
      <h1 class="mb-3">{{ currentPage.title }}</h1>
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
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['currentPage'])
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
</style>