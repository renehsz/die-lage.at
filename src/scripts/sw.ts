declare let self: ServiceWorkerGlobalScope;

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { setDefaultHandler } from 'workbox-routing';
import { offlineFallback } from 'workbox-recipes';
import { NetworkFirst } from 'workbox-strategies';

clientsClaim();

// Precache all the assets
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST, {
    ignoreURLParametersMatching: [/.*/], // Ignore all URL parameters
});

setDefaultHandler(new NetworkFirst());

// Fallback when a resource is not cached for some reason and cannot be fetched from the network
offlineFallback({
    pageFallback: '/offline.html',
});

// Listen for the user's confirmation to update the app
self.addEventListener('message', (event) => {
    // This message arrives from the page when the user has accepted the update
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
});

