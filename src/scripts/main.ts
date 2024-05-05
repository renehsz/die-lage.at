import { LageApp } from './app';
import { initSettingsStore } from './settings_store';
//import { initNotificator } from './notificator';
import { initServiceWorker } from './sw_register';

function init() {
    initSettingsStore();
    //initNotificator();

    const app = new LageApp();
    document.querySelector('main')!.appendChild(app);

    initServiceWorker();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

