import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { LovelaceCard, LovelaceCardConfig } from "./types";

window.customCards.push({
  type: "screensaver-test-card",
  name: "Screen Saver Test Card",
  preview: true,
  description: "A super simple test card with static text.",
});

@customElement("screensaver-test-card")
export class ScreenSaverTest extends LitElement implements LovelaceCard {
  public getCardSize(): number | Promise<number> {
    return 1;
  }

  public setConfig(config: LovelaceCardConfig): void {
    // No config needed for test
  }

  protected render(): TemplateResult {
    return html`
      <div class="container">
        <div class="message">
          🚀 SmartQasa Test Card<br />
          This is static text.<br />
          If you can see this, rendering works in Fully.
        </div>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: block;
        width: 100vw;
        height: 100vh;
        background-color: black;
      }

      .container {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .message {
        color: white;
        font-size: 2rem;
        font-weight: bold;
        text-align: center;
        padding: 1rem;
      }
    `;
  }
}
