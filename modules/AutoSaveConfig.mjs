/**
 * Saves the properties in localStorage automatically when they are set.
 *
 * @class AutoSaveConfig
 */
class AutoSaveConfig {

  /**
   * Creates an instance of AutoSaveConfig.
   * This class saves the properties in localStorage automatically when they are set.
   * @param {*} [configDefault={}] - default values of config
   * @param {string} [name='Config'] - name in localStorage
   * @memberof AutoSaveConfig
   */
  constructor(configDefault = {}, name = 'Config') {
    this.config = JSON.parse(JSON.stringify(configDefault)); // clone default
    this.nameInStorage = name;
    this.handler = {
      set: (obj, prop, value) => {
        obj[prop] = this.toProxy(value);
        localStorage.setItem(this.nameInStorage, JSON.stringify(this.config));
        return true;
      },
    };
    const savedConfig = JSON.parse(localStorage.getItem(this.nameInStorage)) || {};
    Object.assign(this.config, savedConfig);
    return this.toProxy(this.config);
  }

  toProxy(value) {
    if (value === null || typeof value !== 'object') { return value; }
    Object.keys(value).forEach((p) => { value[p] = this.toProxy(value[p]); });
    return new Proxy(value, this.handler);
  }
}

export { AutoSaveConfig };
