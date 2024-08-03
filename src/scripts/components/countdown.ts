import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import { until } from 'lit/directives/until.js';
import { store } from '../settings_store';

@customElement('lage-countdown')
export class LageCountdownEl extends LitElement {
    private timeLeft: TimeLeftCalculator;

    constructor() {
        super();
        setInterval(() => this.requestUpdate(), 1000);

        const endDate = this.getEndDate();
        this.timeLeft = new TimeLeftCalculator(endDate);
    }

    private async getEndDate(): Promise<Date> {
        const s = await store.get('endDate');
        if (!s) {
            return Promise.resolve(new Date(0));
        }
        let date = new Date(s);
        // we want midnight / the start of the next day
        date.setDate(date.getDate() + 1);
        date.setHours(0 /* h */, 0 /* min */, 0 /* s */, 0 /* ms */);
        return Promise.resolve(date);
    }

    override render() {
        const t = this.timeLeft;
        t.update();
        return html`
            ${until(t.getTimeLeftStr())}
        `;
    }

    static override styles = css`
        ul {
            display: inline-block;
            list-style-type: none;
            padding: 0;
        }
        li {
            display: inline-block;
            margin: 0 0.5em;
            min-width: 8em;
            text-align: center;
            font-family: 'Black Ops One', monospace;
        }
        li.sep {
            margin: 0;
            vertical-align: top;
            min-width: 0;
        }
        li span {
            display: block;
            font-size: 1.5em;
        }
        li span.num {
            font-size: 4.5em;
        }
        @media (max-width: 850px) {
            ul {
                display: block;
            }
        }
        @media (max-width: 700px) {
            li {
                margin: 0 0.2em;
                min-width: 7em;
            }
            li span {
                font-size: 1.25em;
            }
            li span.num {
                font-size: 4em;
            }
        }
        @media (max-width: 500px) {
            li {
                margin: 0;
                min-width: 6.25em;
            }
            li span {
                font-size: 1em;
            }
            li span.num {
                font-size: 3.5em;
            }
        }
        @media (max-width: 410px) {
            li {
                min-width: 5.5em;
            }
            li span {
                font-size: 0.75em;
            }
            li span.num {
                font-size: 3em;
            }
        }
        @media (max-width: 350px) {
            li {
                min-width: 4.5em;
            }
            li span {
                font-size: 0.6em;
            }
            li span.num {
                font-size: 2.5em;
            }
        }

        /* button */
        a {
            display: inline-block;
            padding: 0.5em 1em;
            margin: 0.5em;
            border: 2px solid white;
            border-radius: 0.5em;
            text-decoration: none;
            font-family: 'Black Ops One', monospace;
            font-size: 1.5em;
            transition: background-color 0.2s;

            color: white;
            background-color: rgba(0, 0, 0, 0.8);
        }
        a:hover {
            background-color: rgba(0, 0, 0, 0.65);
        }

        @media (prefers-color-scheme: dark) {
            a {
                color: white;
                background-color: rgba(255, 255, 255, 0.025);
            }
            a:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }
        }
    `;
}

function dateToNum(date: Date): number {
    return date as unknown as number;
}

class TimeLeftCalculator {
    private endDate: Promise<Date>;
    private timeLeft: Promise<number>;

    constructor(endDate: Promise<Date>) {
        this.endDate = endDate;
        this.timeLeft = this.calculateTimeLeft();
    }

    private async calculateTimeLeft(): Promise<number> {
        const endDate = await this.endDate;
        if (endDate.getTime() === 0) {
            return Promise.resolve(-1);
        }
        const now = dateToNum(new Date());
        const end = dateToNum(endDate);
        if (now >= end)  return Promise.resolve(0);
        return Promise.resolve(end - now);
    }

    update() {
        this.timeLeft = this.calculateTimeLeft();
    }

    static getWeeksLeft(timeLeft: number): number {
        return Math.floor(timeLeft / 1000 / 60 / 60 / 24 / 7);
    }
    static getDaysLeft(timeLeft: number): number {
        return Math.floor(timeLeft / 1000 / 60 / 60 / 24) % 7;
    }
    static getHoursLeft(timeLeft: number): number {
        return Math.floor(timeLeft / 1000 / 60 / 60) % 24;
    }
    static getMinutesLeft(timeLeft: number): number {
        return Math.floor(timeLeft / 1000 / 60) % 60;
    }
    static getSecondsLeft(timeLeft: number): number {
        return Math.floor(timeLeft / 1000) % 60;
    }

    async getTimeLeftStr(): Promise<TemplateResult> {
        const timeLeft = await this.timeLeft;
        if (timeLeft === -1) {
            return html`
                <a href="/settings">
                    Abrüstdatum festlegen
                </a>
            `;
        }

        const w = TimeLeftCalculator.getWeeksLeft(timeLeft);
        const d = TimeLeftCalculator.getDaysLeft(timeLeft);
        const h = TimeLeftCalculator.getHoursLeft(timeLeft);
        const m = TimeLeftCalculator.getMinutesLeft(timeLeft);
        const s = TimeLeftCalculator.getSecondsLeft(timeLeft);

        return html`
            <ul>
                <li>
                    <span class="num">${w}</span>
                    <span class="desc">Woche${w == 1 ? '' : 'n'}</span>
                </li>
                <li>
                    <span class="num">${d}</span>
                    <span class="desc">Tag${d == 1 ? '' : 'e'}</span>
                </li>
            </ul>
            <ul>
                <li>
                    <span class="num">${pad2(h)}</span>
                    <span class="desc">Stunde${h == 1 ? '' : 'n'}</span>
                </li>
                <li class="sep">
                    <span class="num">:</span>
                </li>
                <li>
                    <span class="num">${pad2(m)}</span>
                    <span class="desc">Minute${m == 1 ? '' : 'n'}</span>
                </li>
                <li class="sep">
                    <span class="num">:</span>
                </li>
                <li>
                    <span class="num">${pad2(s)}</span>
                    <span class="desc">Sekunde${s == 1 ? '' : 'n'}</span>
                </li>
            </ul>
        `;
    }

    async getEndDateStr(): Promise<string> {
        const d = await this.endDate;
        if (d.getTime() === 0) {
            return Promise.resolve('');
        }

        return Promise.resolve(d.toLocaleDateString('de-AT'));
    }
}

function pad2(n: number): string {
    return String(n).padStart(2, '0');
}

