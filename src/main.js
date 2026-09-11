import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { warmCache } from './event'

createApp(App).use(router).mount('#app')

// Populate the offline caches for pages the visitor has not opened yet.
warmCache()
