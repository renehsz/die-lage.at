import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import { store } from '../settings_store';
import { notificator } from '../notificator';

@customElement('settings-view')
export class SettingsView extends LitElement {
    override render() {
        return html`
            <h1>Einstellungen</h1>
            <ul>
                <li>
                    <label for="endDate">Abrüstdatum (letzter Tag)</label>
                    <br>
                    <input type="date" id="endDate" name="endDate"
                        min=${new Date().toISOString().split('T')[0] /* today */}
                        value=${until(store.get('endDate'), '')}
                        @change=${this.onEndDateChange}>
                    <br>
                </li>
                <!--
                <li class="oneline">
                    <label for="dailyNotification">Tägliche Lagemeldung (Benachrichtigung)</label>
                    <input type="checkbox" id="dailyNotification" name="dailyNotification"
                        ?checked=${until(store.get('dailyNotification'))}
                        @change=${this.onDailyNotificationChange}>
                </li>
                -->
            </ul>
        `;
    }

    onEndDateChange(event: Event) {
        const target = event.target as HTMLInputElement;
        store.set('endDate', target.value);
    }

    async onDailyNotificationChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const enabled = target.checked;
        if (enabled) {
            await notificator.enable();
        } else {
            await notificator.disable();
        }
        store.set('dailyNotification', enabled ? '1' : '0');
    }

    static override styles = css`
        h1 {
            font-family: 'Khand', sans-serif;
            font-size: 3em;
        }
        ul {
            list-style-type: none;
            font-size: 1.2em;
            text-align: left;
            padding: 0;
        }
        li {
            margin-bottom: 1em;
        }

        li.oneline {
            display: flex;
            align-items: center;
        }
    `;
}

