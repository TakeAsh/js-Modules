import { prepareElement } from '../../modules/PrepareElement.mjs';

class ClockColor {
  constructor() {
    this.name = 'W/B';
    this.textColor = '#ffffff';
    this.backgroundColor = '#000000';
    this.assign(...arguments);
  }
  toJSON() { return `${this.name};${this.textColor};${this.backgroundColor}`; }
  assign(src) {
    let m;
    if (arguments.length == 1
      && typeof arguments[0] == 'string'
      && (m = /^(?<name>[^;]+);(?<text>#[0-9A-Fa-f]{6});(?<back>#[0-9A-Fa-f]{6})$/.exec(arguments[0]))) {
      this.name = m.groups['name'].replace(/;/, '_');
      this.textColor = m.groups['text'];
      this.backgroundColor = m.groups['back'];
    } else if (arguments.length == 3) {
      this.name = arguments[0].replace(/;/, '_');
      this.textColor = arguments[1];
      this.backgroundColor = arguments[2];
    }
  }
  valueOf() { return this.toJSON(); }
  compareTo(other) { return this.name.localeCompare(other.name); }
  toOption() {
    return prepareElement({ tag: 'option', text: this.name, value: this.toJSON(), });
  }
}

class ClockColors extends Array {
  static get [Symbol.species]() { return Array; }
  constructor() {
    super();
    this.names = [];
    this.assign(Array.from(arguments));
  }
  toJSON() { return this.map(color => color.toJSON()); }
  assign(src) {
    if (!Array.isArray(src) || src.length == 0) { return; }
    this.push(...src.map(color => new ClockColor(color)));
  }
  push() {
    Array.from(arguments)
      .filter(color => color instanceof ClockColor)
      .forEach(color => {
        if (this.includes(color)) { this.remove(color); }
        super.push(color);
        //this.sort((a, b) => a.compareTo(b));
        this.names = this.map(color => color.name);
      });
    return this;
  }
  includes(color) {
    return color instanceof ClockColor
      && this.names.includes(color.name);
  }
  remove(color) {
    const index = this.names.indexOf(color.name);
    if (index < 0) { return this; }
    this.splice(index, 1);
    this.names = this.map(color => color.name);
    return this;
  }
  toOptions() {
    return this.map(color => color.toOption());
  }
}

export { ClockColor, ClockColors };
