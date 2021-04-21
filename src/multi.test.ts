import { marker, only } from "./multi";

const receivedUppercase: Array<string> = [];
const receivedToInt: Array<string> = [];
beforeEach(() => {
  receivedUppercase.splice(0, Infinity);
  receivedToInt.splice(0, Infinity);
});

// function uppercase(input: string) {
//   receivedUppercase.push(input);
//   return input.toUpperCase();
// }

// function toInt(input: string) {
//   receivedToInt.push(input);
//   return parseInt(input, 10);
// }

describe.skip("multi", () => {
  function subject(uppercase, toInt) {
    return function* mixed() {
      yield uppercase("first");
      yield toInt("42");
      yield uppercase("second");
      yield toInt("7");
    };
  }

  const uppercaseToken = marker();
  const toIntToken = marker();
  const withAll = subject(uppercaseToken, toIntToken);
  const uppercaseOnly = only(withAll, uppercaseToken);
  const toIntOnly = only(withAll, toIntToken);

  test("uppercase", () => {
    expect(Array.from(uppercaseOnly())).toEqual(["first", "second"]);
  });

  test("toInt", () => {
    expect(Array.from(toIntOnly())).toEqual(["42", "7"]);
  });
});
