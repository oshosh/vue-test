<template>
  <div>
    <h2>Sign In</h2>
    <form @submit.prevent="handleSignIn">
      <label for="username">Username:</label>
      <input type="text" v-model="username" />
      <br />
      <label for="password">Password:</label>
      <input type="password" v-model="password" />
      <br />
      <button type="submit">Sign In</button>
    </form>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { API } from '@/api/interceptors';
import { useStore } from 'vuex';
import router from '@/router';

export default {
  name: 'SignIn',
  setup() {
    const store = useStore();
    const username = ref('test');
    const password = ref('test_password');
    const isAuthenticated = computed(() => store.getters.isAuthenticated);

    onMounted(() => {
      const checkAuthentication = async () => {
        await store.dispatch('checkAuthentication');

        if (isAuthenticated.value) {
          router.push({ path: '/home' });
        }
      };
      checkAuthentication();
    });

    const postLogin = (data) => {
      return API.request({
        method: 'POST',
        url: '/auth/login',
        data,
      });
    };

    const handleSignIn = async () => {
      const { data, status } = await postLogin({
        username: username.value,
        password: password.value,
      });

      if (status === 200) {
        console.log(data);
        router.push({ path: '/home' });
      } else {
        console.error('실패');
      }
    };
    return { handleSignIn, username, password };
  },
};
</script>

<style></style>
