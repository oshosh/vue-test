<template>
  <router-view />
  <!-- <div class="wrapper">
    <button @click="handleUnsubscribe">Unsubscribe</button>
    <button @click="handleTry">Try Subscribe</button>
    <button @click="handleCallPush">Call Push</button>
    <button @click="handleLocalPush">Local Push</button>
  </div> -->
</template>

<script>
import { onMounted, reactive, toRefs } from 'vue';
import { getApi, postApi } from './util/api';

export default {
  name: 'App',
  setup() {
    const state = reactive({
      endpoint: '',
      keys: {
        p256dh: '',
        auth: '',
      },
      isPageUnloading: true,
    });

    onMounted(async () => {
      // await registerServiceWorker();
      // await subscribe();
    });

    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) return;

      // 이미 등록되어있는 정보 가져오기
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        // 없으면 서비스 워커 등록
        await navigator.serviceWorker.register('/service-worker.js');
      }

      return registration;
    };

    const subscribe = async () => {
      if (!('Notification' in window)) {
        alert('알림을 지원하지 않는 데스크탑 브라우저입니다');
        return;
      }

      if (Notification.permission === 'granted') {
        // 이미 알림 권한이 허가됐는지 확인한다. 그렇다면, 알림을 표시한다.
        // await showNotification('안녕하세요!');
        await subscribePush();
        return;
      }

      // 알림 권한이 거부된 상태는 아니라면
      if (Notification.permission !== 'denied') {
        // 사용자에게 알림 권한 승인을 요청한다
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          // showNotification('알림이 승인 되었습니다.');
          await subscribePush();
        }
      }
    };

    const unSub = async () => {
      const reg = await navigator.serviceWorker.ready;
      console.log(reg);
      if (reg) {
        const subscription = await reg.pushManager.getSubscription();

        if (subscription) {
          const result = await subscription.unsubscribe();
          console.log(result);
          // localStorage의 공개키 삭제
          // UnSubscription이 발생 했을 경우 공개키를 server에 던져야하는지는 고민해봐야함.
        }
      }
    };

    const handleUnsubscribe = async () => {
      await unSub();
    };

    const handleTry = async () => {
      await registerServiceWorker();
      await subscribe();
    };

    const handleCallPush = async () => {
      await postApi('/fcm/push2', {
        endpoint: state.endpoint,
        keys: {
          p256dh: state.keys.p256dh,
          auth: state.keys.auth,
        },
      });
    };

    const handleLocalPush = () => {
      showNotification();
    };

    const subscribePush = async () => {
      const { applicationServerKey } = await getApi('/fcm/getKey'); // 서버로 부터 public key를 받아옴

      const options = {
        userVisibleOnly: true, // 푸시 알림을 사용자에게 보여줄지에 대한 여부이며 true로 설정
        applicationServerKey, // 서버에서 받은 VAPID 공개키
      };
      // 공개키를 localStorage로 들고 있을지는 고민해야함.

      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        await unSub();

        // 구독 요청 성공 후 푸시 서비스에서 PushSubscription 객체를 받는다.
        const subscription = await registration.pushManager.subscribe(options);

        if (subscription) {
          let key = subscription.getKey('p256dh');
          let auth = subscription.getKey('auth');

          console.log(btoa(String.fromCharCode.apply(null, new Uint8Array(key))));
          console.log(btoa(String.fromCharCode.apply(null, new Uint8Array(auth))));

          state.endpoint = subscription.endpoint;
          state.keys = {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(key))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(auth))),
          };

          await postApi('/fcm/push', {
            endpoint: subscription.endpoint,
            keys: state.keys,
          });
        }
      }
    };

    // window.addEventListener('beforeunload', async function (event) {
    //   debugger;
    //   if (!state.isPageUnloading) {
    //     var confirmationMessage = '정말로 나가시겠습니까?';
    //     event.returnValue = confirmationMessage; // Standard for most browsers
    //     return confirmationMessage; // For some older browsers
    //   }
    // });

    // window.addEventListener('unload', async function () {
    //   await getApi('/fcm/getKey');
    //   debugger;
    //   // 페이지가 언로드되면서 브라우저가 닫히는지, 새로고침되는지 여부를 확인할 수 있음
    //   // 이 부분에서 서버로 상태를 전송하거나 필요한 작업을 수행할 수 있음
    // });
    // // 뒤로가기를 통해 벗어날 때의 이벤트
    // window.addEventListener('popstate', function () {
    //   state.isPageUnloading = true;
    //   // 브라우저가 뒤로가기를 통해 벗어나는 경우
    // });

    const showNotification = async (body) => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('IssueReporter', {
          body: body,
          icon: 'https://kbds-digital.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10552?size=xxlarge',
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          tag: 'noti',
        });
      });
    };

    return { ...toRefs(state), handleUnsubscribe, handleCallPush, handleTry, handleLocalPush };
  },
};
</script>

<style>
.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
button {
  padding: 20px 0px;
  margin-top: 20px;
}
</style>
