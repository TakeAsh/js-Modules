'use strict';

const d = document;

/**
 * Create HTMLElement with specified attributes, CSS classes, CSS styles, dataset, event handlers, and child elements.
 *
 * @param {*} tagInfo - The object that has HTML element definition.
 * @return {HTMLElement} created HTMLElement
 */
function prepareElement(tagInfo) {
  if (!tagInfo.tag) { return; }
  const elm = d.createElement(tagInfo.tag);
  delete tagInfo.tag;
  if (tagInfo.classes) {
    tagInfo.classes.forEach((name) => {
      elm.classList.add(name);
    });
    delete tagInfo.classes;
  }
  if (tagInfo.style) {
    elm.style = stringifyStyle(tagInfo.style);
    delete tagInfo.style;
  }
  if (tagInfo.dataset) {
    Object.assign(elm.dataset, tagInfo.dataset);
    delete tagInfo.dataset;
  }
  if (tagInfo.events) {
    Object.keys(tagInfo.events)
      .forEach((event) => { elm.addEventListener(event, tagInfo.events[event]); });
    delete tagInfo.events;
  }
  if (tagInfo.children) {
    tagInfo.children
      .forEach((child) => { elm.appendChild(prepareElement(child)); });
    delete tagInfo.children;
  }
  Object.assign(elm, tagInfo);
  return elm;
}

/**
 * add CSS style to the document.
 *
 * @param {*} definition - The object that has CSS style definition.
 * @param {Document} doc - DOM document to be added style. When doc is undefined, CSS style is added to current document.
 */
function addStyle(definition, doc) {
  doc = doc || d;
  const style = d.createElement('style');
  style.textContent = Object.keys(definition)
    .map((selector) => `${selector} {\n${stringifyStyle(definition[selector], '  ')}\n}`)
    .join('\n');
  doc.head.appendChild(style);
}

/**
 * Stringify CSS style.
 *
 * @param {*} style - The object that has CSS style definition.
 * @param {string} [indent=''] - The indent for each properties.
 * @return {string} - stringified CSS style.
 */
function stringifyStyle(style, indent = '') {
  return Object.keys(style)
    .map((key) => `${indent}${camelToKebab(key)}: ${style[key]};`)
    .join('\n');
}

/**
 * Convert symbol name from camelCase to kebab-case.
 *
 * @param {string} name - Symbol name in camelCase.
 * @return {string} - Symbol name in kebab-case.
 */
function camelToKebab(name) {
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

/**
 * Convert symbol name from kebab-case to camelCase.
 *
 * @param {string} name - Symbol name in kebab-case.
 * @return {string} - Symbol name in camelCase.
 */
function kebabToCamel(name) {
  return name.replace(/-([a-z])/g, (match, p1) => p1.toUpperCase());
}
