import { DOMParser, parseHTML } from "linkedom";
import { within } from "@testing-library/dom";
// import user from "@testing-library/user-event";
import "@testing-library/jest-dom";

function defineCustomElement(superclass, generator): typeof superclass {
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

describe.only("defineCustomElement()", () => {
  const DOM = parseHTML(`<!doctype html><html lang=en>
		<custom-one></custom-one>
	`);

  function* ExampleElement() {}

  it("can create", () => {
    const CustomElement = defineCustomElement(DOM.HTMLElement, ExampleElement);
    DOM.window.customElements.define("custom-one", CustomElement);

    // expect(DOM.document.querySelector("custom-one")!.shadowRoot!.toString()).toEqual("");
    // const subject = within(DOM.document.body);
    const subject = within(
      DOM.document.querySelector("custom-one")!.shadowRoot!
        .firstElementChild! as HTMLElement
    );
    expect(subject.getByText("Some text")).toBeDefined();
  });
});
