# Unyielding: Lightweight Components using Generator Functions

## Install

```console
npm add unyielding
```

## Examples

```ts
import { html, renderToString } from "unyielding";

function Nav(links) {
  yield '<nav aria-label="Primary">';
  yield '<ul>';

  for (const link of links) {
    yield NavLink(link);
  }

  yield '</ul>';
  yield '</nav>';
}

function NavLink(link) {
  yield '<li>';
  yield html`<a href="${link.url}">`;
  yield link.title;
  yield '</a>';
  yield '<li>';
}

async function (request) {
  return await renderToString([
    Nav([
      { url: '/', title: 'Home' },
      { url: '/pricing', title: 'Pricing' },
      { url: '/features', title: 'Features' },
      { url: '/terms', title: 'Terms & Conditions' },
    ])
  ]);
}
```
