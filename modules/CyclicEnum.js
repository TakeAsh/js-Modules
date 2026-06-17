class CyclicEnum extends Array {
  constructor(...args) {
    super();
    const enumItem = {};
    for (let i = args.length - 1; i > 0; --i) {
      if (typeof args[i] == 'function' && typeof args[i - 1] == 'string') {
        const pair = args.splice(i - 1, 2);
        Object.defineProperty(enumItem, pair[0], {
          value: pair[1],
          enumerable: false,
        });
        --i;
      }
    }
    args.forEach((key, index) => {
      let name = key;
      let item = Object.create(enumItem);
      const m = /^(?<name>[^:]+):\s*(?<value>[\s\S]+)$/.exec(key);
      if (m) {
        name = m.groups.name;
        const tmp = JSON.parse(m.groups.value);
        Object.assign(item, tmp === Object(tmp)
          ? tmp // Object
          : {   // Primitive
            [Symbol.toPrimitive](hint) {
              return hint === 'number' ? Number(tmp) :
                hint === 'string' ? name :
                  tmp;
            },
            valueOf: () => tmp,
          });
      }
      Object.assign(item, {
        toString: () => name,
        toJSON: () => name,
        index: index,
        next: () => this[(index + 1) % args.length],
      });
      Object.defineProperty(this, name, {
        value: this[index] = Object.freeze(item),
        enumerable: false,
      });
    });
    Object.defineProperty(this, 'prototypeOfItem', {
      get() { return enumItem },
      enumerable: false,
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
