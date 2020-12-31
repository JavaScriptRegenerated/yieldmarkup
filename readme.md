# Unyielding: Lightweight Components using Generator Functions

## Install

```console
npm add unyielding
```

## Examples

```javascript
import { html, renderToString } from "unyielding";

function Nav(links) {
  yield html`<nav aria-label="Primary">`;
  yield html`<ul>`;

  for (const link of links) {
    yield NavLink(link);
  }

  yield html`</ul>`;
  yield html`</nav>`;
}

function NavLink(link) {
  yield html`<li>`;
  yield html`<a href="${link.url}">`;
  yield link.title;
  yield html`</a>`;
  yield html`<li>`;
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

### Data attributes

```javascript
function Item({ id, title }) {
  yield html`<article ${dataset({ id })}>`;
  yield '<h2>';
  yield title;
  yield '</h2>';
  yield '</article>';
}
```
