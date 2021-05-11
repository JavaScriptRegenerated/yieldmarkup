import { generateUniqueID } from "./unique";

export type PresentableValue = string | number | Promise<PresentableValue> | undefined | null | boolean;

export type SideEffect = { type: string };

export const safeStringSymbol = Symbol("safeStringSymbol");

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
    } else if (safeStringSymbol in child) {
      yield child[safeStringSymbol]();
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

export function safe(input: string) {
  return {
    [safeStringSymbol]() {
      return input;
    }
  };
}

export function* html(literals, ...values) {
  for (let i = 0; i < literals.length; i++) {
    yield safe(literals[i]);
    if (values[i] != null && values[i] !== false) {
      yield values[i];
    }
  }
}

export function* attributes(
  items: Record<string, PresentableValue> | Iterable<[string, PresentableValue]> | Array<[string, PresentableValue]>
) {
  const iterable: Iterable<[string, PresentableValue]> = items[Symbol.iterator]
    ? items as any
    : Object.entries(items);

  function* present(key: string, value: PresentableValue) {
    if (value === false || value == null) return;
    yield key;
    if (typeof value === 'string') {
      yield "=";
      yield html`"`;
      yield value;
      yield html`"`;
    }
  }

  let count = 0;
  for (const [key, value] of iterable) {
    if (value === false || value == null) continue;
    if (count > 0) yield " ";

    if (typeof value === 'object' && typeof value.then === 'function') {
      yield Promise.resolve(value).then(value => Array.from(present(key, value)));
    } else {
      yield present(key, value);
    }

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
