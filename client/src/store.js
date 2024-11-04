import { createStore } from 'vuex';
import { debounce } from 'lodash';
import socket from './socket';

let currentListener = null;
let previousPageId = null;

const store = createStore({
  state: {
    pages: [],
    shifts: [],
    currentPage: {
      lastEditedBy: '', // Track the last editor
    },
    toasts: [],
    toastId: 0,
    searchResults: [],
    currentShift: null,
    incidents: [],
    usersOnPage: [],
    clients: [],
    slaQuotas: {},
    lastUpdateSource: 'server', // Track the source of the last update
  },
  mutations: {
    setPages(state, pages) {
      state.pages = pages;
    },
    setCurrentPage(state, page) {
      state.currentPage = {
        ...page,
        lastEditedBy: page.lastEditedBy || 'Unknown' // Assign lastEditedBy, default to 'Unknown' if missing
      };
    },
    addPage(state, page) {
      state.pages.push(page);
    },
    setShifts(state, shifts) {
      state.shifts = shifts;
    },
    setCurrentShift(state, shift) {
      state.currentShift = shift;
    },
    updatePage(state, page) {
      const index = state.pages.findIndex(p => p.id === page.id);
      if (index !== -1) {
        state.pages.splice(index, 1, page);
      }
    },
    addShift(state, shift) {
      state.shifts.push(shift);
    },
    updateShift(state, shift) {
      const index = state.shifts.findIndex(s => s.id === shift.id);
      if (index !== -1) {
        state.shifts.splice(index, 1, shift);
      }
    },
    setClients(state, clients) {
      state.clients = clients;
      state.clientNameToIdMap = clients.reduce((map, client) => {
        map[client.client] = client.id;
        return map;
      }, {});
    },
    setSLAQuotas(state, { clientId, quotas }) {
      state.slaQuotas[clientId] = quotas;
    },
    updateSLAQuotas(state, { clientId, quotas }) {
      state.slaQuotas[clientId] = quotas; // Update the specific SLA quotas for the client
    },
    addToast(state, toast) {
      const id = state.toastId++;
      toast.id = id;
      state.toasts.push(toast);

      setTimeout(() => {
        state.toasts = state.toasts.filter(t => t.id !== id);
      }, 3000);
    },
    setUsersOnPage(state, users) {
      if (JSON.stringify(state.usersOnPage) !== JSON.stringify(users)) {
        console.log('Setting users on page:', users);
        state.usersOnPage = users;
      }
    },
    setSearchResults(state, results) {
      state.searchResults = results;
    },
    setIncidents(state, incidents) {
      state.incidents = incidents;
    },
    setLastUpdateSource(state, source) {
      state.lastUpdateSource = source;
    },
    deletePage(state, pageId) {
      state.pages = state.pages.filter(p => p.id !== pageId);
      if (state.currentPage && state.currentPage.id === pageId) {
        state.currentPage = null;
      }
    },
  },
  actions: {
    async deletePage({ commit }, { pageId }) {
      try {
        const response = await fetch(`/api/records/${pageId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          commit('deletePage', pageId);  // Update Vuex state immediately
          
        } else {
          const errorText = await response.text();
          throw new Error(`Failed to delete page: ${errorText}`);
        }
      } catch (error) {
        console.error('Error deleting the page:', error);
        throw error;
      }
    },
    async fetchPages({ commit, dispatch }) {

      try {
        console.log(localStorage.getItem('user'));
        const response = await fetch('/api/records');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        commit('setPages', data);
        if (data.length > 0) {
          dispatch('fetchPageDetails', data[0].id);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        commit('addToast', { message: `Fetch pages error: ${error.message}`, type: 'danger' });
      }
    },
    debouncedPerformSearch: debounce(async function ({ commit }, searchTerm) {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const results = await response.json();
        commit('setSearchResults', results);
      } catch (error) {
        console.error('Search error: Record not found');
        commit('addToast', { message: `Search error: Record not found`, type: 'danger' });
      }
    }, 200),
    async fetchPageDetails({ commit }, pageId) {

      if (previousPageId) {
        socket.emit('leavePage', { pageId: previousPageId });
      }

      try {
        const response = await fetch(`/api/records/${pageId}`);
        if (!response.ok) {
          throw new Error(`HTTP status: ${response.status}`);
        }
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          console.log("Received response:", data);
          commit('setCurrentPage', data);

          socket.emit('viewPage', { pageId: data.id });
          previousPageId = data.id;

          // Remove the previous listener before adding a new one
          if (currentListener) {
            console.log('Removing previous usersOnPage listener');
            socket.off('usersOnPage', currentListener);
          }

          // Attach a new listener
          currentListener = (users) => {
            console.log('Users on page event received:', users);
            commit('setUsersOnPage', users);
          };
          

          socket.on('usersOnPage', currentListener);

        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          commit('addToast', { message: `JSON parse error: ${parseError.message}`, type: 'danger' });
        }
      } catch (networkError) {
        console.error('Network or response error:', networkError);
        commit('addToast', { message: `Network error: ${networkError.message}`, type: 'danger' });
      }
    },
    async fetchLatestPage({ commit }) {
      try {
        const response = await fetch('/api/latest-page');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching latest page:', error);
        commit('addToast', { message: `Fetch latest page error: ${error.message}`, type: 'danger' });
      }
    },
    debouncedUpdatePageDetails: debounce(async function ({ commit }, { page, source }) {
      try {
        const userName = localStorage.getItem('user') || 'Unknown';
        const response = await fetch(`/api/records/${page.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...page, source, lastEditedBy: userName })
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        commit('setCurrentPage', data);
        commit('updatePage', data);
      } catch (error) {
        console.error('Error updating page details:', error);
        commit('addToast', { message: `Update page error: ${error.message}`, type: 'danger' });
      }
    }, 200),
    debouncedCopyHandover: debounce(async function ({ commit }) {
      try {
        const response = await fetch('/api/copy-handover', { method: 'POST' });
        const newPage = await response.json();
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        //commit('addPage', newPage);
        commit('setCurrentPage', newPage);
        
      } catch (error) {
        console.error('Error creating handover from template:', error);
        commit('addToast', { message: `Copy handover error: ${error.message}`, type: 'danger' });
      }
    }, 200),

    debouncedCreateHandoverTemplate: debounce(async function ({ commit }) {
      try {
        const response = await fetch('/api/copy-template', { method: 'POST' });
        const newPage = await response.json();
        //commit('addPage', newPage);
        commit('setCurrentPage', newPage);
        //commit('addToast', { message: 'New template created successfully.', type: 'success' });
      } catch (error) {
        console.error('Error creating handover from template:', error);
        commit('addToast', { message: `Create template error: ${error.message}`, type: 'danger' });
      }
    }, 200),
    // shift management
    async fetchShifts({ commit }) {
      try {
        const response = await fetch('/api/shifts');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        commit('setShifts', data);
      } catch (error) {
        console.error('Error fetching shifts:', error);
        commit('addToast', { message: `Fetch shifts error: ${error.message}`, type: 'danger' });
      }
    },
    async fetchShiftDetails({ commit }, shiftId) {
      try {
        const response = await fetch(`/api/shifts/${shiftId}`);
        if (!response.ok) {
          throw new Error(`HTTP status: ${response.status}`);
        }
        const data = await response.json();
        commit('setCurrentShift', data);
        return data;
      } catch (error) {
        console.error('Error fetching shift details:', error);
        commit('addToast', { message: `Fetch shift details error: ${error.message}`, type: 'danger' });
      }
    },
    async createShift({ commit }, shift) {
      try {
        const response = await fetch('/api/shifts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shift)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        commit('addShift', data);
        commit('setCurrentShift', data);
        commit('addToast', { message: 'Shift created successfully.', type: 'success' });
      } catch (error) {
        console.error('Error creating shift:', error);
        commit('addToast', { message: `Create shift error: ${error.message}`, type: 'danger' });
      }
    },
    async updateShiftDetails({ commit }, shift) {
      try {
        const response = await fetch(`/api/shifts/${shift.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(shift)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        commit('setCurrentShift', data);
        commit('updateShift', data);
        commit('addToast', { message: 'Shift details updated successfully.', type: 'success' });
      } catch (error) {
        console.error('Error updating shift details:', error);
        commit('addToast', { message: `Update shift error: ${error.message}`, type: 'danger' });
      }
    },
    async fetchClients({ commit }) {
      try {
        const response = await fetch('/api/clients');
        const clients = await response.json();
        commit('setClients', clients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    },
    async fetchClientSLAQuotas({ commit }, clientId) {
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        
        // Check the raw response first
        const rawData = await response.text();
        console.log('Raw response:', rawData);  // This will help us see what's returned
    
        if (!response.ok) {
          throw new Error('Failed to fetch client SLA quotas');
        }
    
        // If rawData is empty or incomplete, check why before parsing
        if (!rawData) {
          throw new Error('No data returned from the server');
        }
    
        const clientData = JSON.parse(rawData); // Parse only if the response is valid
        commit('setClientSLAQuotas', clientData.slaQuotas);
        return clientData;
      } catch (error) {
        console.error('Error fetching client SLA quotas:', error);
      }
    },
    async updateClientSLAQuotas({ commit }, { clientId, slaQuotas }) {
      try {
        const response = await fetch(`/api/clients/${clientId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slaQuotas }),
        });
        if (!response.ok) {
          throw new Error('Failed to update client SLA quotas');
        }
        const updatedClient = await response.json();
        console.log('SLA quotas updated successfully:', updatedClient);
        commit('updateClientSLAQuotas', updatedClient);
        commit('addToast', { message: 'Client SLA quotas updated successfully.', type: 'success' });
      } catch (error) {
        console.error('Error updating client SLA quotas:', error);
      }
    },
    async createNewClient({ commit }, newClient) {
      try {
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newClient),
        });
    
        if (response.status === 409) {
          // Handle duplicate client error
          const errorData = await response.json();
          commit('addToast', { message: errorData.error || 'Client with this name already exists.', type: 'error' });
          return;
        }
    
        if (!response.ok) {
          throw new Error('Failed to add new client');
        }
    
        const addedClient = await response.json();
        commit('addToast', { message: 'New client added successfully', type: 'success' });
        return addedClient;
      } catch (error) {
        console.error('Error adding new client:', error);
        commit('addToast', { message: 'Failed to add new client', type: 'error' });
        throw error; // rethrow the error if additional handling is needed elsewhere
      }
    }           
  },
});


//let socketId = null;
socket.on('connect', () => {
  console.log('Socket.io connected');
});

socket.on('disconnect', () => {
  console.log('Socket.io disconnected');
  socket.connect(); // Attempt reconnect
});

//socket.removeAllListeners('usersOnPage');
socket.on('usersOnPage', (users) => {
  store.commit('setUsersOnPage', users);
});

// Global toast notification for page creation
socket.on('pageCreated', (data) => {
  console.log('Page created event received:', data);
  const pageExists = store.state.pages.some(page => page.id === data.id);
  if (!pageExists) {
    store.commit('addPage', data);
    store.commit('addToast', { message: 'Handover copied successfully.', type: 'success' });
  }
});
// Global toast notification for page updates
socket.on('pageUpdated', (data) => {
  console.log('Page updated event received:', data);
  if (store.state.lastUpdateSource !== 'client') { // Only update if not from client
    store.commit('updatePage', data);
    if (store.state.currentPage && store.state.currentPage.id === data.id) {
      store.commit('setCurrentPage', data);
      
    }
  }
  store.commit('addToast', { message: `Page ${data.title} updated`, type: 'success' });
  store.commit('setLastUpdateSource', 'server'); // Reset to server after handling
});

socket.removeAllListeners('pageDeleted');
socket.on('pageDeleted', (data) => {
  console.log('Page deleted event received:', data);
  if (data.title && data.title !== 'undefined') {
    store.commit('addToast', { message: `Page "${data.title}" deleted successfully.`, type: 'danger' });
  }
  store.commit('deletePage', data.id);
  
});




export default store;
