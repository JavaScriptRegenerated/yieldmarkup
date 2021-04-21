import { button, output } from "./forms";
import { add, on, renderToDOM, state } from "./events";
import { screen, waitFor } from "@testing-library/dom";
import user from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { generateUniqueID } from "./unique";
jest.mock("./unique.ts");

beforeEach(() => {
  (generateUniqueID as jest.Mock).mockImplementation(function () {
    this.id = (this.id || 0) + 1;
    return `|UNIQUE${this.id}|`;
  });
});

describe("clicking", () => {
  function* Buttons() {
    const count = yield state(function count() {
      return 0;
    });

    yield on.click(add(1, count));
    yield button("Some button");
    yield output(count);
  }

  test("button", async () => {
    await renderToDOM(Buttons, document.body);
    const buttonEl = screen.getByRole("button", { name: "Some button" });
    expect(buttonEl).toBeInTheDocument();

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("0");

    user.click(buttonEl);
    // await screen.findByRole("status", { name: "1" });
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("1");
    });

    // user.click(buttonEl);
    // await waitFor(() => {
    //   expect(statusEl).toHaveTextContent("2");
    // });
  });
});
