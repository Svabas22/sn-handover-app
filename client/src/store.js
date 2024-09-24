import { createStore } from 'vuex';
import { debounce } from 'lodash';
import socket from './socket';

const store = createStore({
  state: {
    pages: [],
    shifts: [],
    currentPage: null,
    toasts: [],
    toastId: 0,
    searchResults: [],
    currentShift: null,
    incidents: [],
    lastUpdateSource: 'server', // Track the source of the last update
  },
  mutations: {
    setPages(state, pages) {
      state.pages = pages;
    },
    setCurrentPage(state, page) {
      state.currentPage = page;
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
    addToast(state, toast) {
      const id = state.toastId++;
      toast.id = id;
      state.toasts.push(toast);

      setTimeout(() => {
        state.toasts = state.toasts.filter(t => t.id !== id);
      }, 3000);
    },
    deletePage(state, pageId) {
      state.pages = state.pages.filter(p => p.id !== pageId);
      state.currentPage = null;
    },
    setSearchResults(state, results) {
      state.searchResults = results;
    },
    setIncidents(state, incidents) {
      state.incidents = incidents;
    },
    setLastUpdateSource(state, source) {
      state.lastUpdateSource = source;
    }
  },
  actions: {
    async fetchPages({ commit, dispatch }) {
      const token = localStorage.getItem('accessToken');
      console.log("Token:", token);
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
    async performSearch({ commit }, searchTerm) {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const results = await response.json();
        commit('setSearchResults', results);
      } catch (error) {
        console.error('Search error: Recotd not found:');
        commit('addToast', { message: `Search error: Record not found`, type: 'danger' });
      }
    },
    async fetchPageDetails({ commit }, pageId) {
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
        const response = await fetch(`/api/records/${page.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...page, source })
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
    async copyHandover({ commit }) {
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
    },
    async createHandoverTemplate({ commit }) {
      try {
        const response = await fetch('/api/copy-template', { method: 'POST' });
        const newPage = await response.json();
        commit('addPage', newPage);
        commit('setCurrentPage', newPage);
        commit('addToast', { message: 'New template created successfully.', type: 'success' });
      } catch (error) {
        console.error('Error creating handover from template:', error);
        commit('addToast', { message: `Create template error: ${error.message}`, type: 'danger' });
      }
    },
    async deletePage({ commit, dispatch }, pageId) {
      try {
        const response = await fetch(`/api/records/${pageId}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error(`Failed to delete page: ${response.statusText}`);
        }
        commit('deletePage', pageId);
        commit('addToast', { message: 'Page deleted successfully.', type: 'success' });
        dispatch('fetchPages'); // Refetch the list of pages to update the state
      } catch (error) {
        console.error('Error deleting page:', error);
        commit('addToast', { message: `Delete page error: ${error.message}`, type: 'danger' });
      }
    },
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
    }
  },
});
socket.removeAllListeners();
socket.on('connect', () => {
  console.log('Socket.io connected');
});

socket.on('disconnect', () => {
  console.log('Socket.io disconnected');
  socket.connect(); // Attempt reconnect
});


socket.on('pageCreated', (data) => {
  console.log('Page created event received:', data);
  const pageExists = store.state.pages.some(page => page.id === data.id);
  if (!pageExists) {
    store.commit('addPage', data);
    store.commit('addToast', { message: 'Handover copied successfully.', type: 'success' });
  }
});

socket.on('pageUpdated', (data) => {
  console.log('Page updated event received:', data);
  if (store.state.lastUpdateSource !== 'client') { // Only update if not from client
    store.commit('updatePage', data);
    if (store.state.currentPage && store.state.currentPage.id === data.id) {
      store.commit('setCurrentPage', data);
      store.commit('addToast', { message: `Page ${store.state.currentPage.title} updated`, type: 'success' });
    }
  }
  store.commit('setLastUpdateSource', 'server'); // Reset to server after handling
});

socket.on('pageDeleted', (data) => {
  console.log('Page deleted event received:', data);
  store.commit('deletePage', data.id);
  if (store.state.currentPage && store.state.currentPage.id === data.id) {
    store.commit('setCurrentPage', null);
    store.commit('addToast', { message: `Page ${store.state.currentPage.title} deleted`, type: 'danger' });
  }
  store.commit('setLastUpdateSource', 'server'); // Reset to server after handling
});

export default store;
