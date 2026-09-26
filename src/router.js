import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/agenda', name: 'agenda', component: () => import('./views/AgendaView.vue') },
  { path: '/speakers', name: 'speakers', component: () => import('./views/SpeakersView.vue') },
  {
    path: '/speakers/:hid',
    name: 'speaker',
    props: true,
    component: () => import('./views/SpeakerView.vue'),
  },
  {
    path: '/entry-pass',
    name: 'entry-pass',
    component: () => import('./views/EntryPassView.vue'),
  },
  {
    path: '/travel-plan',
    name: 'travel-plan',
    component: () => import('./views/TravelPlanView.vue'),
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, saved) => saved ?? { top: 0 },
})
