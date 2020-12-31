import { html } from "./index";

export function* textbox(label: string) {
  yield html`<label>${label}</label>`;
  yield html`<input type=text>`;
}