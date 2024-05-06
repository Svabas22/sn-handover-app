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
  import io from 'socket.io-client';
  import axios from 'axios';
  const uri = process.env.SOCKET_URI;
  export default {
      name: 'formTest',
      data() {
          return {
              recordName: '',
              comment: '',
              records: [],
              socket: null, // Add this line to hold the socket
          };
      },
      created() {
          this.initializeSocket();
      },
      methods: {
          initializeSocket() {
              this.socket = io(uri); // Connect to your server, adjust URL as necessary

              // Listening for 'recordCreated' event from the server
              this.socket.on('recordCreated', (newRecord) => {
                  this.records.push(newRecord); // Add the new record to existing records
              });

              // Re-fetch records when needed (optional, depending on your app logic)
              this.socket.on('refreshRecords', this.fetchRecords);
          },
          async createRecord() {
              try {
                  const response = await axios.post('/api/records', {
                      name: this.recordName,
                      comment: this.comment
                  });
                  console.log('Record created:', response.data);
                  // Emit an event to all clients about the new record
                  this.socket.emit('createRecord', response.data);
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
          },
          beforeDestroy() {
              if (this.socket) {
                  this.socket.disconnect();
              }
          }
      }
  };
  </script>

  