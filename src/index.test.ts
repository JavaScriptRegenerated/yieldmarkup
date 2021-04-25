import { renderToString, html, unique, attributes, dataset } from "./index";
import { generateUniqueID } from "./unique";

jest.mock("./unique.ts");
(generateUniqueID as jest.Mock).mockImplementation(function () {
  this.id = (this.id || 0) + 1;
  return `|UNIQUE${this.id}|`;
});

describe("renderToString()", () => {
  const htmlStart = `<!doctype html><html lang=en><meta charset=utf-8><meta name=viewport content="width=device-width">`;

  test("empty array", async () => {
    await expect(renderToString([])).resolves.toEqual("");
  });

  test("array of empty string", async () => {
    await expect(renderToString([""])).resolves.toEqual("");
  });

  test("array of simple strings", async () => {
    await expect(renderToString(["abc", "def"])).resolves.toEqual("abcdef");
  });

  test("array of simple strings and HTML", async () => {
    await expect(renderToString(["abc", "<br>", "def"])).resolves.toEqual(
      "abc&lt;br&gt;def"
    );
  });

  test("array of simple strings and HTML and angled brackets", async () => {
    await expect(
      renderToString(["abc", "<br>", "2 > 1", "<br>", "0 < 3"])
    ).resolves.toEqual("abc&lt;br&gt;2 &gt; 1&lt;br&gt;0 &lt; 3");
  });

  test("array of unsafe HTML values", async () => {
    await expect(renderToString([`abc <>&'"`])).resolves.toEqual(
      `abc &lt;&gt;&amp;'&quot;`
    );
  });

  test("array of simple strings and falsey values", async () => {
    await expect(
      renderToString(["abc", null, undefined, false, "def"])
    ).resolves.toEqual("abcdef");
  });

  test("array of simple string promises", async () => {
    await expect(
      renderToString([Promise.resolve("abc"), Promise.resolve("def")])
    ).resolves.toEqual("abcdef");
  });

  test("array of HTML string promises", async () => {
    await expect(
      renderToString([Promise.resolve(`abc <>&'"`), Promise.resolve("def")])
    ).resolves.toEqual(`abc &lt;&gt;&amp;'&quot;def`);
  });

  test("array of simple string and falsey promises", async () => {
    await expect(
      renderToString([
        Promise.resolve("abc"),
        Promise.resolve(undefined),
        Promise.resolve(null),
        Promise.resolve(false),
        Promise.resolve("def"),
      ])
    ).resolves.toEqual("abcdef");
  });

  test("generator function yielding nothing", async () => {
    await expect(renderToString((function* () {})())).resolves.toEqual("");
  });

  test("generator function yielding empty string", async () => {
    await expect(
      renderToString(
        (function* () {
          yield "";
        })()
      )
    ).resolves.toEqual("");
  });

  test("generator function yielding simple string", async () => {
    await expect(
      renderToString(
        (function* () {
          yield "abc";
        })()
      )
    ).resolves.toEqual("abc");
  });

  test("array with generator function yielding simple string", async () => {
    await expect(
      renderToString([
        (function* () {
          yield "abc";
        })(),
      ])
    ).resolves.toEqual("abc");
  });

  test("array with strings and generator functions", async () => {
    await expect(
      renderToString([
        "first",
        (function* () {
          yield "|abc|";
        })(),
        "last",
      ])
    ).resolves.toEqual("first|abc|last");
  });

  test("array with strings and generator functions yielding mix of promises", async () => {
    await expect(
      renderToString([
        "first",
        (function* () {
          yield "|abc|";
          yield Promise.resolve("|def|");
        })(),
        "last",
      ])
    ).resolves.toEqual("first|abc||def|last");
  });

  test("deeply nested generator functions yielding promises of strings", async () => {
    function* genPromise() {
      yield Promise.resolve("|gen.promise <>|");
    }
    function* genPromiseOuter() {
      yield Promise.resolve(genPromise());
    }

    await expect(
      renderToString(["first", genPromiseOuter(), "last"])
    ).resolves.toEqual("first|gen.promise &lt;&gt;|last");
  });

  test("deeply nested generator functions yielding promises of HTML", async () => {
    function* genPromise() {
      yield Promise.resolve(html`|gen.promise <>|`);
    }
    function* genPromiseOuter() {
      yield Promise.resolve(genPromise());
    }

    await expect(
      renderToString(["first", genPromiseOuter(), "last"])
    ).resolves.toEqual("first|gen.promise <>|last");
  });

  test("unique", async () => {
    await expect(
      renderToString(["first", unique(), unique(), "second", unique(), "third"])
    ).resolves.toEqual("first|UNIQUE1||UNIQUE2|second|UNIQUE3|third");
  });

  describe("html``", () => {
    test("just html", async () => {
      await expect(
        renderToString([html`<div>Some content</div>`])
      ).resolves.toEqual("<div>Some content</div>");
    });

    test("interpolated string", async () => {
      await expect(
        renderToString([html`<div>Some ${'dynamic'} content</div>`])
      ).resolves.toEqual("<div>Some dynamic content</div>");
    });

    test("interpolated string promise", async () => {
      await expect(
        renderToString([html`<div>Some ${Promise.resolve('dynamic')} content</div>`])
      ).resolves.toEqual("<div>Some dynamic content</div>");
    });

    test("interpolated number", async () => {
      await expect(
        renderToString([html`<div>Some ${123} number</div>`])
      ).resolves.toEqual("<div>Some 123 number</div>");
    });
    
    test("interpolated array", async () => {
      await expect(
        renderToString([html`<div>Some ${[123, 'abc']} array</div>`])
      ).resolves.toEqual("<div>Some 123abc array</div>");
    });

    test("interpolated number promise", async () => {
      await expect(
        renderToString([html`<div>Some ${Promise.resolve(123)} number</div>`])
      ).resolves.toEqual("<div>Some 123 number</div>");
    });
    
    test("interpolated array promise", async () => {
      await expect(
        renderToString([html`<div>Some ${Promise.resolve([123, 'abc'])} array</div>`])
      ).resolves.toEqual("<div>Some 123abc array</div>");
    });
    
    test("interpolated promised component yielding array promise", async () => {
      function* Example() {
        yield Promise.resolve([123, 'abc']);
      }
      await expect(
        renderToString([html`<div>Some ${Promise.resolve(Example())} array</div>`])
      ).resolves.toEqual("<div>Some 123abc array</div>");
    });

    test("interpolated HTML is escaped", async () => {
      await expect(
        renderToString([html`<div>Some ${'<div>dynamic</div>'} content</div>`])
      ).resolves.toEqual("<div>Some &lt;div&gt;dynamic&lt;/div&gt; content</div>");
    });

    test("interpolated HTML promise is escaped", async () => {
      await expect(
        renderToString([html`<div>Some ${Promise.resolve('<div>dynamic</div>')} content</div>`])
      ).resolves.toEqual("<div>Some &lt;div&gt;dynamic&lt;/div&gt; content</div>");
    });
  });

  describe("attributes()", () => {
    test("passing object", async () => {
      await expect(
        renderToString([html`<div ${attributes({ first: '1', second: '2' })}>Some content</div>`])
      ).resolves.toEqual(`<div first="1" second="2">Some content</div>`);
    });
    
    test("passing map", async () => {
      await expect(
        renderToString([html`<div ${attributes(new Map([['first', '1'], ['second', '2']]))}>Some content</div>`])
        ).resolves.toEqual(`<div first="1" second="2">Some content</div>`);
      });

      test("passing object with promised values", async () => {
        await expect(
          renderToString([html`<div ${attributes({ first: Promise.resolve('1'), second: Promise.resolve('2') })}>Some content</div>`])
        ).resolves.toEqual(`<div first="1" second="2">Some content</div>`);
      });
  });

  describe("dataset()", () => {
    test("passing object", async () => {
      await expect(
        renderToString([html`<div ${dataset({ "kebab-key": '1', camelCaseKey: '2' })}>Some content</div>`])
      ).resolves.toEqual(`<div data-kebab-key="1" data-camel-case-key="2">Some content</div>`);
    });

    test("passing map", async () => {
      await expect(
        renderToString([html`<div ${dataset(new Map([['kebab-key', '1'], ['camelCaseKey', '2']]))}>Some content</div>`])
      ).resolves.toEqual(`<div data-kebab-key="1" data-camel-case-key="2">Some content</div>`);
    });
  });

  describe("components", () => {
    function* Div(content) {
      yield html`<div>`;
      yield content;
      yield html`</div>`;
    }

    function* Term(content) {
      yield html`<dt>`;
      yield Div(content);
      yield html`</dt>\n`;
    }

    function soon(delay) {
      return {
        then(resolve) {
          setTimeout(resolve, delay);
        },
      };
    }

    function* Definition(content) {
      yield html`<dd>`;
      yield Promise.resolve(soon(1)).then(() => content);
      yield html`</dd>\n`;
    }

    function* DefinitionList(content) {
      yield html`<dl>\n`;
      yield content;
      yield html`</dl>\n`;
    }

    function* Example() {
      yield DefinitionList([
        Term("first"),
        Definition("1st"),
        Term("second"),
        Definition("2nd"),
      ]);
    }

    test("nested components", async () => {
      await expect(renderToString(Example())).resolves.toEqual(`<dl>
<dt><div>first</div></dt>
<dd>1st</dd>
<dt><div>second</div></dt>
<dd>2nd</dd>
</dl>
`);
    });

    test("nested components in array", async () => {
      await expect(renderToString([Example()])).resolves.toEqual(`<dl>
<dt><div>first</div></dt>
<dd>1st</dd>
<dt><div>second</div></dt>
<dd>2nd</dd>
</dl>
`);
    });
  });
});
