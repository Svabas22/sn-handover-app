<template>
    <div id="content-container">
        <div class="main-container">
            <h1>Engineers on Shift</h1>
            <ul>
            <li v-for="engineer in engineerData" :key="engineer.id">{{ engineer.name }}</li>
            </ul>
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

<style>

</style>