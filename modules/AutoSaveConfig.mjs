/**
 * Saves the properties in localStorage automatically when they are set.
 * This save automatically when first level properties are set (ex. conf.prop1 = x; ), 
 * but this don't save when second level properties are set (ex. conf.prop1.prop2 = x; ).
 *
 * @class AutoSaveConfig
 */
class AutoSaveConfig {

  /**
   * Creates an instance of AutoSaveConfig.
   * This class saves the properties in localStorage automatically when they are set.
   * This save automatically when first level properties are set (ex. conf.prop1 = x; ), 
   * but this don't save when second level properties are set (ex. conf.prop1.prop2 = x; ).
   * @param {*} [configDefault={}] - default values of config
   * @param {string} [name='Config'] - name in localStorage
   * @memberof AutoSaveConfig
   */
  constructor(configDefault = {}, name = 'Config') {
    const config = JSON.parse(JSON.stringify(configDefault)); // clone default
    Object.defineProperty(config, '#nameInStorage', { value: name, });
    const savedConfig = JSON.parse(localStorage.getItem(config['#nameInStorage'])) || {};
    Object.assign(config, savedConfig);
    return new Proxy(
      config,
      {
        set: (obj, prop, value) => {
          obj[prop] = value;
          localStorage.setItem(obj['#nameInStorage'], JSON.stringify(obj));
          return true;
        },
      }
    );
  }
}

export { AutoSaveConfig };
