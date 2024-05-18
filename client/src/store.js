import { createStore } from "vuex";

export default createStore({
    state() {
        return {
            engineerData: {},
            client1Data: {},
            client2Data: {},
            activeClient: 'client1',
        };
    },
    mutations: {
        setEngineerData(state, payload) {
            state.engineerData = payload;
        },
        setClientData(state, { client, data }) {
            state[`${client}Data`] = data;
        },
        setActiveClient(state, client) {
            state.activeClient = client;
        }
    },
    actions: {
        async fetchEngineerData({ commit }) {
        //   const response = await fetch('/api/engineers');
        //   const data = await response.json();
        //   commit('setEngineerData', data);
        const data = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
            { id: 3, name: 'Charlie' },
        ]
        commit('setEngineerData', data);
        },
        async fetchClientData({ commit }, client) {
          const response = await fetch(`/api/${client}`);
          const data = await response.json();
          commit('setClientData', { client, data });
        },
    },
    getters: {
        activeClientData(state) {
          return state[`${state.activeClient}Data`];
        }
      }
});