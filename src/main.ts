import './assets/main.css';

import { createApp } from 'vue';
import MainPage from './MainPage.vue';

const app = createApp(MainPage);
app.config.globalProperties.version = import.meta.env.VITE_APP_VERSION;
app.mount('#app');
