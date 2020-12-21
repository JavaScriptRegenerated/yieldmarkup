const map = { '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": '#039' }
function escapeToHTML(input) {
  // return input.replace(/[&<>"']/g, (s) => `&${map[s]};`);
  return input.replace(/[&<>]/g, (s) => `&${map[s]};`)
}

function processValue(value) {
  if (typeof value === 'number') {
    return `${value}`
  } else if (/^\s*[<]/.test(value)) {
    // Treat as already safe HTML
    return value
  } else {
    // Escape to safe HTML
    return escapeToHTML(value)
  }
}

/**
 * 
 * @param {Generator} children 
 * @return {Promise<string>}
 */
export async function renderToString(children) {
  function process(child) {
    if (child == null || child == false) return

    if (typeof child === 'string' || typeof child === 'number') {
      return processValue(child)
    } else if (typeof child.then === 'function') {
      // output.push(child.then(processValue))
      return child.then(process)
    } else if (child[Symbol.iterator]) {
      const inner = []
      consumeIterable(child, inner)
      return Promise.all(inner).then(items => items.filter(Boolean).join(''))
    }
  }

  function consumeIterable(iteratable, output) {
    for (const child of iteratable) {
      output.push(process(child))
    }
  }

  const root = []
  consumeIterable(children, root)

  const resolved = await Promise.all(root);
  return resolved.filter(Boolean).join('')
}

export function* html(literals, ...values) {
  for (let i = 0; i < literals.length; i++) {
    yield literals[i]
    if (values[i] != null && values[i] !== false) {
      yield values[i]
    }
  }
}
