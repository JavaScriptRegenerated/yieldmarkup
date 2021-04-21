import { dataset, renderToString } from "./index";
import { built } from "./forms";

interface AddAction {
  type: "add";
  amount: number;
  name: string;
}
type Action = AddAction;

interface OnClickEffect {
  type: "click";
  action: Action;
}
interface StateEffect {
  type: "state";
  builder: () => string | number;
}

type Effect = OnClickEffect | StateEffect;

export async function renderToDOM(component: () => Generator, el: HTMLElement) {
  const stateStore = new Map<string, string | number>();

  let needsRenderPromise: Promise<void> | null = null;
  function setNeedsRender() {
    needsRenderPromise ||= Promise.resolve().then(render);
  }

  function handleEffect(effect: Effect) {
    console.log("handleEffect", effect.type);
    if (effect.type === "click") {
      const { action } = effect;
      built.push(
        dataset([["click", JSON.stringify(action)] as any]),
        dataset([
          [`click-${action.type}-${action.name}`, `${action.amount}`] as any,
        ])
      );
    } else if (effect.type === "state") {
      const { builder } = effect;
      console.log("STATE!", stateStore);
      function readValue() {
        console.log("reading state");
        const value = stateStore.get(builder.name);
        console.log("existing value", value);
        if (value != null) {
          return value;
        }

        const newValue = builder();
        stateStore.set(builder.name, newValue);
        return newValue;
      }

      let current = readValue();
      return {
        name: builder.name,
        toString() {
          return current.toString();
        },
      };
    }

    console.log("side effect", effect);
    return;
  }

  function handleEvents(el: HTMLElement) {
    el.addEventListener("click", (event) => {
      const el = event.target;
      if (el instanceof HTMLElement) {
        console.log("CLICK!", el.outerHTML, el.dataset);
        if (el.dataset.click) {
          try {
            const action = JSON.parse(el.dataset.click) as Action;
            if (action.type === "add") {
              const currentValue = stateStore.get(action.name);
              if (typeof currentValue === "number") {
                const newValue = currentValue + action.amount;
                stateStore.set(action.name, newValue);
                // setNeedsRender();
                console.log("RERENDERING!", newValue);
                render();
                console.log("RERENDERED!");
              }
            }
          } catch (error) {}
        }
      }
    });
  }

  async function render() {
    console.log("RENDER BEGIN");
    const html = await renderToString(component(), { handleEffect });
    // el.innerHTML = html;
    const foreignDocument = document.implementation.createHTMLDocument();
    const fragment = foreignDocument
      .createRange()
      .createContextualFragment("<div id=wrapper>" + html + "</div>");
    console.log("fragment", fragment);
    // console.log('wrapper', foreignDocument)
    // const frameElement = document.importNode(
    //   foreignDocument.querySelector('#wrapper')!,
    //   true
    // );
    // console.log("FRAME", frameElement);

    const destinationRange = document.createRange();
    destinationRange.selectNodeContents(el);
    destinationRange.deleteContents();

    el.appendChild(fragment);
    // const sourceRange = frameElement.ownerDocument?.createRange();
    // if (sourceRange) {
    //   sourceRange.selectNodeContents(frameElement);
    //   el.appendChild(sourceRange.extractContents());
    // }

    console.log("RENDER END");
  }

  handleEvents(el);
  await render();
}

export const on = {
  click(action: Action): OnClickEffect {
    return { type: "click", action };
  },
};

export function state<Value extends number | string>(
  builder: () => Value
): StateEffect {
  return { type: "state", builder };
}

export function add(amount: number, to: () => number): AddAction {
  return {
    type: "add",
    amount,
    name: to.name,
  };
}
