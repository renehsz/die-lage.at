import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
// TODO: Refactor all icon code into separate web component
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { iconToSVG, iconToHTML, replaceIDs } from '@iconify/utils';
import iconSettings from '@iconify/icons-mdi/settings';
import iconClose from '@iconify/icons-mdi/close';

@customElement('lage-nav')
export class LageNavigationEl extends LitElement {
    override firstUpdated(changedProperties: Map<string | number | symbol, unknown>) {
        super.firstUpdated(changedProperties);
        window.addEventListener('pushstate', () => this.requestUpdate());
        window.addEventListener('popstate', () => this.requestUpdate());
        window.addEventListener('replacestate', () => this.requestUpdate());
    }

    override render() {
        const is_close = window.location.pathname !== '/';
        return html`
            <a href="/${is_close ? '' : 'settings'}" aria-label="${is_close ? 'Close' : 'Settings'}">
                ${unsafeHTML(this.renderIcon(is_close ? iconClose : iconSettings))}
            </a>
        `;
    }

    renderIcon(iconData: any): string {
        const renderData = iconToSVG(iconData, { height: 'auto' });
        const svg = iconToHTML(replaceIDs(renderData.body), renderData.attributes);
        return svg;
    }

    static override styles = css`
        :host {
            display: block;
            position: fixed;
            top: 0;
            right: 0;
        }
        
        /* Center the icon */
        a {
            display: flex;
            justify-content: center;
        }
        svg {
            display: block;
            margin: auto;
        }

        a {
            padding: 1rem;
            width: 2rem;
            height: 2rem;
        }

        a {
            color: #666;
        }
        a:hover {
            color: #000;
        }
        @media(prefers-color-scheme: dark) {
            a {
                color: #AAA;
            }
            a:hover {
                color: #FFF;
            }
        }
    `;
}

