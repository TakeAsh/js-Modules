class CyclicEnum extends Array {
  #enumItem = {};

  #initEnumItem(args) {
    [
      ['parent', this], // this => CyclicEnum
      ['toString', function() { return this.name; }], // this => enumItem
      ['toJSON', function() { return this.name; }],   // this => enumItem
      ['next', function() { // this => enumItem
        return this.parent[(this.index + 1) % this.parent.length];
      }],
      ['prev', function() { // this => enumItem
        return this.parent[(this.index + this.parent.length - 1) % this.parent.length];
      }],
    ].forEach(prop => {
      Object.defineProperty(this.#enumItem, prop[0], {
        value: prop[1],
        enumerable: true,
        writable: false,
      });
    });
    for (let i = args.length - 1; i > 0; --i) {
      if (typeof args[i] == 'function' && typeof args[i - 1] == 'string') {
        const pair = args.splice(i - 1, 2);
        this.#addItemMethod(pair[0], pair[1]);
        --i;
      }
    }
  }

  #addItemMethod(name, func) {
    Object.defineProperty(this.#enumItem, name, {
      value: func,
      enumerable: true,
      writable: false,
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
      name: name,
      index: index,
    });
    Object.defineProperty(this, name, {
      value: this[index] = Object.freeze(item),
      enumerable: false,
      writable: false,
    });
  }

  constructor(...args) {
    super();
    this.#initEnumItem(args);
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
