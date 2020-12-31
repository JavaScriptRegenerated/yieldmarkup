import { generateUniqueID } from "./unique";

const map = { "&": "amp", "<": "lt", ">": "gt", '"': "quot", "'": "#039" };
function escapeToHTML(input) {
  // return input.replace(/[&<>"']/g, (s) => `&${map[s]};`);
  return input.replace(/[&<>]/g, (s) => `&${map[s]};`);
}

function processValue(value) {
  if (typeof value === "number") {
    return `${value}`;
  } else if (/^\s*[<]/.test(value)) {
    // Treat as already safe HTML
    return value;
  } else {
    // Escape to safe HTML
    return escapeToHTML(value);
  }
}

/**
 *
 * @param {Generator} iteratable
 */
export function* renderGenerator(iteratable) {
  function* process(child) {
    if (child == null || child == false) return;

    if (typeof child === "string" || typeof child === "number") {
      yield processValue(child);
    } else if (child === Symbol.for("unique")) {
      yield generateUniqueID("unique");
    } else if (typeof child.then === "function") {
      yield child.then((result) => Promise.all(process(result)));
    } else if (child[Symbol.iterator]) {
      yield* renderGenerator(child);
    }
  }

  for (const child of iteratable) {
    yield* process(child);
  }
}

/**
 *
 * @param {Generator} children
 * @return {Promise<string>}
 */
export async function renderToString(children) {
  const resolved = await Promise.all(renderGenerator(children));
  return resolved.filter(Boolean).join("");
}

export function* html(literals, ...values) {
  for (let i = 0; i < literals.length; i++) {
    yield literals[i];
    if (values[i] != null && values[i] !== false) {
      yield values[i];
    }
  }
}

export function unique() {
  return Symbol.for("unique");
}
