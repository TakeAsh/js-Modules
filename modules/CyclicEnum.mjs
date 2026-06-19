class CyclicEnum extends Array {
  #enumItem = {};

  #addItemMethod(name, func) {
    Object.defineProperty(this.#enumItem, name, {
      value: func,
      enumerable: false,
    });
  }

  #addItem(name, index, value) {
    const item = Object.create(this.#enumItem);
    Object.assign(item, value === Object(value)
      ? value // Object
      : {     // Primitive
        [Symbol.toPrimitive](hint) {
          return hint === 'number' ? Number(value) :
            hint === 'string' ? name :
              value;
        },
        valueOf: () => value,
      });
    Object.assign(item, {
      toString: () => name,
      toJSON: () => name,
      index: index,
      next: () => this[(index + 1) % this.length],
    });
    Object.defineProperty(this, name, {
      value: this[index] = Object.freeze(item),
      enumerable: false,
    });
  }

  constructor(...args) {
    super();
    for (let i = args.length - 1; i > 0; --i) {
      if (typeof args[i] == 'function' && typeof args[i - 1] == 'string') {
        const pair = args.splice(i - 1, 2);
        this.#addItemMethod(pair[0], pair[1]);
        --i;
      }
    }
    if (args.length == 1 && args[0] === Object(args[0])) {
      const enumItems = args[0];
      for (const key in enumItems) {
        if (typeof enumItems[key] == 'function') {
          this.#addItemMethod(key, enumItems[key]);
          delete enumItems[key];
        }
      }
      Object.keys(enumItems).forEach((key, index) => {
        this.#addItem(key, index, enumItems[key]);
      });
    } else {
      args.forEach((key, index) => {
        this.#addItem(key, index, key);
      });
    }
    Object.defineProperty(this, 'prototypeOfItem', {
      get() { return this.#enumItem },
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

export { CyclicEnum };
