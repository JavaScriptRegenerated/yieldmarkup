# Unyielding: Lightweight Components using Generator Functions

## Install

```console
npm add unyielding
```

## Examples

```javascript
import { html, renderToString } from "unyielding";

function* NavLink(link) {
  yield html`<li>`;
  yield html`<a href="${link.url}">`;
  yield link.title;
  yield html`</a>`;
  yield html`<li>`;
}

function* Nav(links) {
  yield html`<nav aria-label="Primary">`;
  yield html`<ul>`;

  for (const link of links) {
    yield NavLink(link);
  }

  yield html`</ul>`;
  yield html`</nav>`;
}

function* PrimaryNav() {
  yield Nav([
    { url: '/', title: 'Home' },
    { url: '/pricing', title: 'Pricing' },
    { url: '/features', title: 'Features' },
    { url: '/terms', title: 'Terms & Conditions' },
  ]);
}

const html = await renderToString([PrimaryNav()]);
```

### Data attributes

```javascript
function Item({ id, title }) {
  yield html`<article ${dataset({ id })}>`;
  yield html`<h2>`;
  yield title;
  yield html`</h2>`;
  yield html`</article>`;
}
```

## TODO / Ideas

```javascript
// Yield function with name of HTML tag
function Nav(links) {
  yield html`<nav aria-label="Primary">`;

  yield function* ul() {
    for (const link of links) {
      yield NavLink(link);
    }
  };

  yield html`</nav>`;
}

// Yield function with name of landmark
function Page() {
  yield PrimaryNav();

  yield function* main() { // <main>
    yield Heading("Welcome!");
  }

  yield function* contentinfo() { // <footer role=contentinfo>
    yield FooterLinks();
  }
}

// Perhaps allow attributes to be set
function Nav2(links) {
  yield function* nav() {
    yield attributes({ "aria-label": "Primary" });

    yield function* ul() {
      for (const link of links) {
        yield NavLink(link);
      }
    };
  }
}
```
