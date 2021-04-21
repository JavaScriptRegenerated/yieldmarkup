export function defineCustomElement(superclass, generator): typeof superclass {
  return class extends superclass {
    constructor() {
      super();
    }

    connectedCallback() {
      console.log(Object.keys(this));
      const shadow = this.attachShadow({ mode: "open" });
      // const divEl = shadow.appendChild(this.ownerDocument.createElement("div"));
      const divEl = shadow.appendChild(
        Object.assign(this.ownerDocument.createElement("div"), {
          textContent: "Some text",
        })
      );
    }
  };
}
