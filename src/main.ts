// Lib
import { createApp } from 'vue'

// Routes
import router from './router'

// Components
import App from './App.vue'

// Styles
import './styles/app.scss';

createApp(App).use(router).mount('#app');
