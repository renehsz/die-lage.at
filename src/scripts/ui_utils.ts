
export function showToast(message: string, options?: { duration?: number, action?: string, actionHandler?: () => void }) {
    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    slideIn(toastEl);

    if (options?.duration) {
        setTimeout(() => {
            destroyToast(toastEl);
        }, options.duration);
    }

    if (options?.action) {
        const actionEl = document.createElement('button');
        actionEl.textContent = options.action;
        actionEl.addEventListener('click', () => {
            options.actionHandler?.();
            destroyToast(toastEl);
        });
        toastEl.appendChild(actionEl);
    } else {
        toastEl.addEventListener('click', () => {
            destroyToast(toastEl);
        });
    }
}

function destroyToast(toastEl: HTMLElement) {
    slideOut(toastEl).then(() => toastEl.remove());
}

function promiseTransitionEnd(el: HTMLElement): Promise<void> {
    return new Promise(resolve => {
        el.addEventListener('transitionend', () => {
            resolve();
        });
    });
}

function slideIn(el: HTMLElement): Promise<void> {
    el.style.transform = 'translateY(100%)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transform = 'translateY(0)';
    }));
    return promiseTransitionEnd(el);
}

function slideOut(el: HTMLElement): Promise<void> {
    el.style.transform = 'translateY(0)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transform = 'translateY(100%)';
    }));
    return promiseTransitionEnd(el);
}

