import { renderToString, html } from "./index";

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
      "abc<br>def"
    );
  });

  test("array of simple strings and HTML and angled brackets", async () => {
    await expect(
      renderToString(["abc", "<br>", "2 > 1", "<br>", "0 < 3"])
    ).resolves.toEqual("abc<br>2 &gt; 1<br>0 &lt; 3");
  });

  test("array of unsafe HTML values", async () => {
    await expect(renderToString([`abc <>&'"`])).resolves.toEqual(
      `abc &lt;&gt;&amp;'"`
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

  describe("components", () => {
    function* Div(content) {
      yield "<div>";
      yield content;
      yield "</div>";
    }

    function* Term(content) {
      yield "<dt>";
      yield Div(content);
      yield "</dt>\n";
    }

    function soon(delay) {
      return {
        then(resolve) {
          setTimeout(resolve, delay);
        },
      };
    }

    function* Definition(content) {
      yield "<dd>";
      yield Promise.resolve(soon(1)).then(() => content);
      yield "</dd>\n";
    }

    function* DefinitionList(content) {
      yield "<dl>\n";
      yield content;
      yield "</dl>\n";
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
