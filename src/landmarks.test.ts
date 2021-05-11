import {
  renderToString,
  html,
  attributes,
} from "./index";

describe("landmarks", () => {
  test("main", async () => {
    await expect(renderToString([
        html`<main></main>`
    ])).resolves.toEqual(`<main></main>`);
  });

  test("navigation", async () => {
    function* NavItem(text: string, link: string, current: boolean) {
        yield html`<li>`;
        yield html`<a ${attributes([['href', link], ['aria-current', current ? 'page' : false]])}>`;
        yield text;
        yield html`</a>`;
        yield html`</li>`;
    }

    await expect(renderToString([
        html`<nav ${attributes([['aria-label', 'Primary']])}>`,
        html`<ul>`,
        NavItem('first', '/first', false),
        NavItem('second', '/second', true),
        html`</ul>`,
        html`</nav>`
    ])).resolves.toEqual(`<nav aria-label="Primary"><ul><li><a href="/first">first</a></li><li><a href="/second" aria-current="page">second</a></li></ul></nav>`);
  });
});
