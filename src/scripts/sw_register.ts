import { Workbox } from 'workbox-window';
import { showToast } from './ui_utils';

// Listen for the first user interaction event.
// In case there is a new version of the app available and the user has not
// interacted with the page, we can reload the page immediately (which should
// be fast since the new service worker has already grabbed the new assets).
// Otherwise, we need to show a toast as the reload wouldn't be seamless.
let userHasInteracted = false;
function initUserInteractionListener() {
    function setupUserInteractionListener(obj: EventTarget, event: string) {
        obj.addEventListener(event, () => {
            userHasInteracted = true;
        }, { once: true });
    }

    setupUserInteractionListener(window, 'click');
    setupUserInteractionListener(window, 'keydown');
    setupUserInteractionListener(window, 'scroll');
}

function initServiceWorkerRegistration() {
    if ('serviceWorker' in navigator) {
        const wb = new Workbox('/sw.js');

        if (!navigator.serviceWorker.controller) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                showToast('App kann nun offline verwendet werden!', { duration: 3500 });
            });
        }

        wb.addEventListener('waiting', async () => {
            // A new service worker has installed, but is waiting to activate.
            // This means that there is a new version of the app available.
            // We can show a toast to the user to let them know and ask if they want to update.
            // If they do, we can tell the service worker to skip waiting and activate immediately.
            wb.addEventListener('controlling', () => {
                window.location.reload();
            });

            // Promise resolves when the user accepts the update
            const updateAccepted = new Promise<boolean>((resolve) => {
                if (!userHasInteracted) {
                    console.log('User has not interacted with the page yet, updating immediately.');
                    resolve(true);
                    return;
                }
                showToast('Eine neue Version ist verfügbar', {
                    action: 'Aktualisieren',
                    actionHandler: () => {
                        console.log('User confirmed the update.');
                        resolve(true);
                    },
                });
            });

            if (await updateAccepted) {
                // The user has accepted the update, tell the service worker to skip waiting
                wb.messageSkipWaiting();
            }
        });

        wb.register();
    }
}

// This needs to be called early to catch any user interactions.
export function initServiceWorker() {
    initUserInteractionListener();
    initServiceWorkerRegistration();
}


