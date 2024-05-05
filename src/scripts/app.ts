import './components/nav';
import './views/lage';
import './views/settings';
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Router } from '@vaadin/router';

@customElement('lage-app')
export class LageApp extends LitElement {
    override firstUpdated(changedProperties: Map<string | number | symbol, unknown>) {
        super.firstUpdated(changedProperties);
        const router = new Router(this.shadowRoot?.querySelector('div#outlet'));
        router.setRoutes([
            { path: '/', component: 'lage-view' },
            { path: '/settings', component: 'settings-view' },
            { path: '(.*)', redirect: '/' },
        ]);
    }

    override render() {
        return html`
            <lage-nav></lage-nav>
            <div id="outlet">
            </div>
        `;
    }
}

