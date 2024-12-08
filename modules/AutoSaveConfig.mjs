/**
 * Saves the properties in localStorage automatically when they are set.
 *
 * @class AutoSaveConfig
 */
class AutoSaveConfig {

  /**
   * Creates an instance of AutoSaveConfig.
   * This class saves the properties in localStorage automatically when they are set.
   * If a property of configDefault is an object and it has 'assign' method, 
   * the property is not overwritten but AutoSaveConfig calls 'assign' method with saved object.
   * @param {*} [configDefault={}] - default values of config
   * @param {string} [name='Config'] - name in localStorage
   * @memberof AutoSaveConfig
   */
  constructor(configDefault = {}, name = 'Config') {
    this.config = configDefault;
    this.nameInStorage = name;
    this.handler = {
      set: (obj, prop, value) => {
        obj[prop] = this.toProxy(value);
        localStorage.setItem(this.nameInStorage, JSON.stringify(this.config));
        return true;
      },
    };
    const savedConfig = JSON.parse(localStorage.getItem(this.nameInStorage)) || {};
    AutoSaveConfig.assign(this.config, savedConfig);
    return this.toProxy(this.config);
  }

  toProxy(value) {
    if (value === null || typeof value !== 'object' || Object.isFrozen(value)) { return value; }
    Object.keys(value).forEach((p) => { value[p] = this.toProxy(value[p]); });
    return new Proxy(value, this.handler);
  }

  static assign(dest, src) {
    for (const prop in dest) {
      if (dest[prop] !== null && typeof dest[prop].assign == 'function') {
        dest[prop].assign(src[prop]);
      } else {
        dest[prop] = src[prop];
      }
    }
  }
}

export { AutoSaveConfig };
