<template>
  <div>
    <input v-model="recordName" placeholder="Record Name">
    <input v-model="comment" placeholder="Comment">
    <button @click="createRecord">Create Record</button>
    <button @click="fetchRecords">Fetch Records</button>
    
    <div v-for="record in records" :key="record.id">
      {{ record.name }} - {{ record.comment }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      recordName: '',
      comment: '',
      records: []
    };
  },
  methods: {
    async createRecord() {
      try {
        const response = await axios.post('/api/records', {
          name: this.recordName,
          comment: this.comment
        });
        console.log('Record created:', response.data);
      } catch (error) {
        console.error('Error creating record:', error);
      }
    },
    async fetchRecords() {
      try {
        const response = await axios.get('/api/records');
        this.records = response.data;
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    }
  }
};
</script>
