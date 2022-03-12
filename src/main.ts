import { createApp, ref } from "vue";
import App from "./App.vue";
import Vue3Lottie from "vue3-lottie";
import "vue3-lottie/dist/style.css";
import Minifier from './libs/minifier';
import { initWorker } from './libs/scale';

var worker = ref<Minifier>(initWorker());

const app = createApp(App, { worker });

app.use(Vue3Lottie);

app.mount("#app");
