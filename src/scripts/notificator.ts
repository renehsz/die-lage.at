
class Notificator {
    constructor() {
    }

    async enable() {
        console.log('enabling notifications');
        if (!('PushManager' in window)) {
            // TODO disable the button
            throw new Error('Push notifications are not supported by this browser');
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            // TODO disable the button
            updateSubscriptionOnServer(null);
            throw new Error('Permission to send notifications was denied');
        }

        const sw_reg = await navigator.serviceWorker.ready;
        const subscription = await sw_reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(''),
        });

        updateSubscriptionOnServer(subscription);
        console.log('Notification subscription:', subscription);
    }

    async disable() {
    }

}

export let notificator: Notificator;

export function initNotificator() {
    notificator = new Notificator();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding)
		.replace(/\-/g, "+")
		.replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; i++) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

async function updateSubscriptionOnServer(subscription: PushSubscription | null) {
    let resp: Response;
    try {
        resp = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        if (!resp.ok) {
            logAndThrowError('Failed to update subscription on server: Response not ok');
        }

        console.log('Updated subscription on server');
    } catch (e: any) {
        logAndThrowError('Failed to update subscription on server', e);
    }
}

function logAndThrowError(msg: string, e: Error | undefined = undefined) {
    if (e) {
        console.error(`${msg}: ${e.message}`);
        throw new Error(`${msg}: ${e.message}`);
    } else {
        console.error(msg);
        throw new Error(msg);
    }
}

