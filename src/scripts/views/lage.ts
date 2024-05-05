import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import '../components/countdown';

@customElement('lage-view')
export class LageView extends LitElement {
    override render() {
        return html`
            <h1>Wie ist die Lage?</h1>
            <lage-countdown></lage-countdown>
        `;
    }

    static override styles = css`
        h1 {
            font-family: 'Khand', sans-serif;
            font-size: 3em;
        }
    `;
}

