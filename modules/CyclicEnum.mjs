class CyclicEnum extends Array {
  constructor(...args) {
    super();
    args.forEach((key, index) => {
      let name = key;
      let value = {};
      const m = /^(?<name>[^:]+):\s*(?<value>[\s\S]+)$/.exec(key);
      if (m) {
        name = m.groups.name;
        const tmp = JSON.parse(m.groups.value);
        value = tmp === null ? {
          [Symbol.toPrimitive](hint) {
            return hint === 'number' ? 0 :
              hint === 'string' ? name :
                null;
          },
        } :
          typeof tmp == 'number' || typeof tmp == 'boolean' ? {
            [Symbol.toPrimitive](hint) {
              return hint === 'number' ? tmp :
                hint === 'string' ? name :
                  tmp;
            },
          } :
            tmp;
      }
      Object.assign(value, {
        toString: () => name,
        toJSON: () => name,
        index: index,
        next: () => this[(index + 1) % args.length],
      });
      Object.defineProperty(this, name, {
        value: this[index] = Object.freeze(value),
        enumerable: false,
      });
    });
    Object.freeze(this);
  }

  static get [Symbol.species]() { return Array; }

  get(key) {
    return this.hasOwnProperty(key) ?
      this[key] :
      this[0];
  }
}

export { CyclicEnum };
