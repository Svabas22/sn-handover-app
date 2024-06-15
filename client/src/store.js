// store.js
import { createStore } from 'vuex';

import io from 'socket.io-client';

const socket = io(process.env.SOCKET_URI);  // Adjust this URL to match your server's address

export default createStore({
  state: {
    pages: [],
    currentPage: null
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
  },
  actions: {
    initializeSocket({ commit }) {
      socket.on('pageCreated', (newPage) => {
        commit('addPage', newPage);
        commit('setCurrentPage', newPage);
      });

      // Additional socket events can be handled here
    },
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
      }
    },
    async fetchPageDetails({ commit }, pageId) {
      try {
        const response = await fetch(`/api/records/${pageId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        commit('setCurrentPage', data);
      } catch (error) {
        console.error('Error fetching page details:', error);
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
      } catch (error) {
        console.error('Error updating page details:', error);
      }
    },
    async copyHandover({ commit }) {
      try {
        const response = await fetch('/api/copy-handover', { method: 'POST' });
        const newPage = await response.json();
        commit('addPage', newPage);  // Commit the new page to the list of pages
        commit('setCurrentPage', newPage);  // Set the new page as the current page
      } catch (error) {
        console.error('Error creating handover from template:', error);
      }
    },
    async createHandoverTemplate({ commit }) {
      try {
        const response = await fetch('/api/copy-template', { method: 'POST' });
        const newPage = await response.json();
        commit('addPage', newPage);  // Commit the new page to the list of pages
        commit('setCurrentPage', newPage);  // Set the new page as the current page
      } catch (error) {
        console.error('Error creating handover from template:', error);
      }
    },
  }
});
