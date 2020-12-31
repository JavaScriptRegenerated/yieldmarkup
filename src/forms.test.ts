import { textbox } from "./forms";
import { renderToString } from "./index";

import { generateUniqueID } from "./unique";
jest.mock("./unique.ts");

beforeEach(() => {
  (generateUniqueID as jest.Mock).mockImplementation(function () {
    this.id = (this.id || 0) + 1;
    return `|UNIQUE${this.id}|`;
  });
});

describe("textbox()", () => {
  test("with label", async () => {
    await expect(renderToString([textbox("Some field")])).resolves.toEqual(
      `<label>Some field</label><input type=text>`
    );
  });
});
