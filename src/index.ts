import { generateUniqueID } from "./unique";

export type PresentableValue = string | number | Promise<PresentableValue>;

export type SideEffect = { type: string };

const map = { "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "#039" };
function escapeToHTML(input) {
  // return input.replace(/[&<>"']/g, (s) => `&${map[s]};`);
  return input.replace(/[&<>"]/g, (s) => `&${map[s]};`);
}

function processValue(value) {
  if (typeof value === "number") {
    return `${value}`;
  } else {
    return escapeToHTML(value);
  }
}

function* flatten(iterable: Iterable<any>) {
  for (const element of iterable) {
    if (!Boolean(element)) continue;
    
    if (Array.isArray(element)) {
      yield *flatten(element);
    } else {
      yield element; 
    }
    
  }
}

/**
 *
 * @param {Iterable<PresentableValue>} iterable
 */
export function* renderGenerator3(iterable) {
  function* process(child) {
    if (child == null || child === false) return;

    if (typeof child === "string" || typeof child === "number") {
      yield processValue(child);
    } else if (child === Symbol.for("unique")) {
      yield generateUniqueID("unique");
    } else if (child instanceof String) {
      // String objects are taken to be html-safe
      yield child;
    } else if (typeof child.then === "function") {
      yield child.then((result) => Promise.all(process(result)));
    } else if (child[Symbol.iterator]) {
      yield* renderGenerator3(child);
    }
  }

  for (const child of iterable) {
    yield* process(child);
  }
}

/**
 *
 * @param {Iterable<PresentableValue>} iterable
 */
export function* renderGenerator(
  iterable,
  options: { handleEffect: (effect: SideEffect) => any }
) {
  const iterator = iterable[Symbol.iterator]();
  let done = false;
  let next;
  while (!done) {
    const current = iterator.next(next);
    const child = current.value;
    done = current.done;
    next = undefined;

    if (child == null || child === false) continue;

    if (typeof child === "string" || typeof child === "number") {
      yield processValue(child);
    } else if (child === Symbol.for("unique")) {
      const id = generateUniqueID("unique");
      next = id;
      yield id;
    } else if (child instanceof String) {
      // String objects are taken to be html-safe
      yield child;
    } else if (typeof child.then === "function") {
      yield child.then((result) => Promise.all(renderGenerator([].concat(result), options)));
    } else if (child[Symbol.iterator]) {
      yield* renderGenerator(child, options);
    } else if (typeof child.type === "string") {
      next = options.handleEffect(child);
    }
  }
}

/**
 *
 * @param {Generator} children
 * @return {Promise<string>}
 */
export async function renderToString(
  children,
  options: { handleEffect: (effect: SideEffect) => any } = { handleEffect() {} }
) {
  const resolved = await Promise.all(renderGenerator(children, options));
  return Array.from(flatten(resolved)).join("");
}

export function* html(literals, ...values) {
  for (let i = 0; i < literals.length; i++) {
    yield new String(literals[i]); // Mark as html-safe by converting to string object
    if (values[i] != null && values[i] !== false) {
      yield values[i];
    }
  }
}

export function* attributes(
  items: Record<string, PresentableValue> | Iterable<[string, PresentableValue]>
) {
  const iterable = items[Symbol.iterator]
    ? (items as Iterable<[string, PresentableValue]>)
    : Object.entries(items);

  let count = 0;
  for (const [key, value] of iterable) {
    if (count > 0) yield " ";
    yield key;
    yield "=";
    yield html`"`;
    yield value;
    yield html`"`;
    count += 1;
  }
}

export function* dataset(
  items: Record<string, PresentableValue> | Iterable<[string, PresentableValue]>
) {
  const iterable = items[Symbol.iterator]
    ? (items as Iterable<[String, String]>)
    : Object.entries(items);

  yield* attributes(
    (function* () {
      for (const [key, value] of iterable) {
        const keyKebab = key.replace(/[A-Z]/g, "-$&").toLowerCase();
        yield [`data-${keyKebab}`, value] as [string, PresentableValue];
      }
    })()
  );
}

export function unique() {
  return Symbol.for("unique");
}
