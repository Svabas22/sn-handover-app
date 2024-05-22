// store.js
import { createStore } from 'vuex';

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
    }
  },
  actions: {
    async fetchPages({ commit, dispatch }) {
      try{
        const response = await fetch('/api/records');
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
      const response = await fetch(`/api/records/${pageId}`);
      const data = await response.json();
      commit('setCurrentPage', data);
    }
  }
});
