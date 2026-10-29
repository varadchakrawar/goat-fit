import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Only register service worker in production over HTTPS, not during local Vite development
    if ('serviceWorker' in navigator && window.location.protocol === 'https:' && window.location.hostname !== 'localhost') {
      navigator.serviceWorker.register('/service-worker.js')
        .then((reg) => console.log('[PWA] Service Worker registered:', reg.scope))
        .catch((err) => console.log('[PWA] Service Worker registration failed:', err));
    }
  })
  .catch((err) => console.error('Bootstrap error:', err));
