import axios from 'axios';
import { createStore } from 'vuex';

export default createStore({
  state: {
    isAuthenticated: false,
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
  },
  actions: {
    async checkAuthentication({ commit }) {
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken) {
        try {
          debugger;
          // 서버에 Access Token을 검증하는 API 호출
          const response = await axios.post('/api/auth/authenticate');
          if (response.data.accessToken) {
            commit('setAuthentication', true);
          } else {
            commit('setAuthentication', false);
          }
        } catch (error) {
          console.error('Authentication Error:', error.response.data.message);
          commit('setAuthentication', false);
        }
      } else {
        commit('setAuthentication', false);
      }
    },
  },
  mutations: {
    setAuthentication(state, isAuthenticated) {
      state.isAuthenticated = isAuthenticated;
    },
  },
});
