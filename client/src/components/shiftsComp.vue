<template>
    <div class="shift-container">
        <NavBarComponent />
        <div class="main-container">
        <h1>Shifts</h1>
        <ul>
            <li v-for="shift in shifts" :key="shift.id" @click="loadShift(shift.id)">
            {{ shift.title }}
            </li>
        </ul>
        <button @click="createShift">Create New Shift</button>
        <div v-if="currentShift">
            <h2>{{ currentShift.title }}</h2>
            <ul>
            <li v-for="engineer in currentShift.engineers" :key="engineer.id">
                {{ engineer.name }}
            </li>
            </ul>
            <button @click="deleteShift(currentShift.id)">Delete Shift</button>
        </div>
        </div>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from 'vuex';
  
  export default {
    name: 'ShiftsComponent',
    computed: {
      ...mapState(['shifts', 'currentShift']),
    },
    methods: {
      ...mapActions(['fetchShifts', 'fetchShiftDetails', 'createShift', 'deleteShift']),
      loadShift(shiftId) {
        this.fetchShiftDetails(shiftId);
      },
      createShift() {
        const newShift = {
          title: 'New Shift',
          engineers: [
            { name: 'Engineer1', id: '' },
            { name: 'Engineer2', id: '' },
            { name: 'Engineer3', id: '' }
          ]
        };
        this.createShift(newShift);
      }
    },
    created() {
      this.fetchShifts();
    }
  }
  </script>
  