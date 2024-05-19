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
    async fetchPages({ commit }) {
      const response = await fetch('/api/records');
      const data = await response.json();
      commit('setPages', data);
    },
    async fetchPageDetails({ commit }, pageId) {
      const response = await fetch(`/api/records/${pageId}`);
      const data = await response.json();
      commit('setCurrentPage', data);
    }
  }
});
