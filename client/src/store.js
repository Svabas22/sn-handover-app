import { createStore } from 'vuex';
//import io from 'socket.io-client';

// Ensure that the SOCKET_URI is correctly configured in your environment variables
//const socket = io(process.env.SOCKET_URI);  

export default createStore({
  state: {
    pages: [],
    currentPage: null,
    toasts: [],  // Array to hold toast messages
    toastId: 0,
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
    }
  },
  actions: {
    // initializeSocket({ commit }) {
    //   socket.on('pageCreated', (newPage) => {
    //     commit('addPage', newPage);
    //     commit('setCurrentPage', newPage);
    //     commit('addToast', { message: 'New page created via Socket.', type: 'info' });
    //   });

    //   socket.on('connectionError', error => {
    //     commit('addToast', { message: `Socket error: ${error}`, type: 'danger' });
    //   });
    // },
    async fetchPages({ commit, dispatch }) {
      try {
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
    async fetchPageDetails({ commit }, pageId) {
      try {
          const response = await fetch(`/api/records/${pageId}`);
          if (!response.ok) {
              throw new Error(`HTTP status: ${response.status}`);
          }
          const text = await response.text();
          console.log("Received response text:", response);
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
    async updatePageDetails({ commit }, page) {
      try {
        const response = await fetch(`/api/records/${page.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(page)
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        commit('setCurrentPage', data);
        commit('addToast', { message: 'Page details updated successfully.', type: 'success' });
      } catch (error) {
        console.error('Error updating page details:', error);
        commit('addToast', { message: `Update page error: ${error.message}`, type: 'danger' });
      }
    },
    async copyHandover({ commit }) {
      try {
        const response = await fetch('/api/copy-handover', { method: 'POST' });
        const newPage = await response.json();
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        commit('addPage', newPage);
        commit('setCurrentPage', newPage);
        commit('addToast', { message: 'Handover copied successfully.', type: 'success' });
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
    }
  },
});
