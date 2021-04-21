class Marker {
  value: any;
  private identifier: {};

  private constructor(identifier: {}, value?: any) {
    this.identifier = identifier;
    this.value = value;
  }

  static base() {
    return new Marker({});
  }

  withValue(value: any) {
    return new Marker(this.identifier, value);
  }

  matches(other: Marker) {
    return this.identifier === other.identifier;
  }
}

export function marker(): (value?: any) => Marker {
  const base = Marker.base();
  return (value) => base.withValue(value);
}

export function only(f: () => Generator, markerBuilder: () => Marker) {
  return function* () {
    const iterator = f()[Symbol.iterator]();
    const marker = markerBuilder();

    while (true) {
      const { value, done } = iterator.next();
      console.log("YIELDED", value);
      if (value instanceof Marker) {
        console.log("matches");
        if (marker.matches(value)) {
          yield marker.value;
        }
      }

      if (done) break;
    }
  };
}
