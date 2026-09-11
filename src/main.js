import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { warmCache } from './event'
import { captureTicketCode } from './ticket'

// Before mount, so the home grid already knows whether to show the Entry Pass tile.
captureTicketCode()

createApp(App).use(router).mount('#app')

// Populate the offline caches for pages the visitor has not opened yet.
warmCache()
