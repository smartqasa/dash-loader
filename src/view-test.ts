import {
  css,
  CSSResult,
  html,
  LitElement,
  nothing,
  PropertyValues,
  TemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { HomeAssistant, LovelaceCard, LovelaceCardConfig } from "./types";
import { createThing } from "custom-card-helpers";

@customElement("my-simple-view")
export class MySimpleView extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private cards: LovelaceCard[] = [];

  public setConfig(config: any): void {
    if (!config.cards) return;

    config.cards.map((cardConfig: LovelaceCardConfig) => {
      const card = createThing(cardConfig) as LovelaceCard;
      this.cards.push(card);
    });
  }

  protected willUpdate(): void {
    if (!this.cards || this.cards.length == 0) return;

    this.cards.map((card: LovelaceCard) => {
      card.hass = this.hass;
    });
  }

  protected render() {
    if (!this.cards) {
      return html`<p>Loading…</p>`;
    }
    return html`
      <div class="simple-view">
        ${this.cards.map(
          (card) => html`<div class="card-wrapper">${card}</div>`
        )}
      </div>
    `;
  }
}
