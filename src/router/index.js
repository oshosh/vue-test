import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
import Home from '../views/home.vue';
import SignIn from '../views/sign-in.vue';

const routes = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }, // 인증이 필요한 페이지
  },
  {
    path: '/sign-in',
    name: 'SignIn',
    component: SignIn,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 전역 네비게이션 가드 설정
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    // 인증이 필요한 페이지인 경우
    await store.dispatch('checkAuthentication');
    if (!store.state.isAuthenticated) {
      // AccessToken이 없는 경우, 로그인 페이지로 리디렉션
      next('/sign-in');
    } else {
      // AccessToken이 있는 경우 계속 진행
      next();
    }
  } else {
    // 인증이 필요하지 않은 페이지인 경우
    next();
  }
});

export default router;
