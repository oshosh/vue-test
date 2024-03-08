<template>
  <div>Home</div>
</template>

<script>
import { onMounted } from 'vue';
export default {
  name: 'HOME',
  setup() {
    onMounted(() => {
      console.log('HOME 로그인이 필요해');
    });

    return {};
  },
};
</script>

<style></style>
