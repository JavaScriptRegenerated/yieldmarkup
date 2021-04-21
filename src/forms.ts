import { html } from "./index";

export const built: Array<any> = [];

export interface Displayable {
  toString(): string;
}

function* yieldBuilt() {
  if (built.length === 0) return;
  yield " ";
  yield* built;
  built.splice(0, Infinity);
}

export function* button(label: Displayable) {
  yield html`<button type=button${yieldBuilt()}>${label}</button>`;
}

export function* textbox(label: string) {
  yield html`<label>${label}</label>`;
  yield html`<input type=text>`;
}

export function* output(children: Displayable) {
  yield html`<output${yieldBuilt()}>${children.toString()}</output>`;
}
