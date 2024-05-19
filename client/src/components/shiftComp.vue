<template>
  <div id="content-container" class="container mt-4">
      <div class="main-container">
          <h5 class="mb-3">Engineers on Shift</h5>
          <div class="list-group">
              <a href="#" class="list-group-item list-group-item-action" v-for="engineer in engineerData" :key="engineer.id">
                  {{ engineer.name }}
              </a>
          </div>
      </div>
  </div>
</template>


<script>
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();

    const engineerData = computed(() => store.state.engineerData);

    // Fetch engineers on component mount
    store.dispatch('fetchEngineerData');

    return { engineerData };
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