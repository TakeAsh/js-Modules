'use strict';

const d = document;

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
    elm.style = flattenStyle(tagInfo.style);
    delete tagInfo.style;
  }
  if (tagInfo.dataset) {
    Object.assign(elm.dataset, tagInfo.dataset);
    delete tagInfo.dataset;
  }
  if (tagInfo.events) {
    Object.keys(tagInfo.events).forEach((event) => {
      elm.addEventListener(event, tagInfo.events[event]);
    });
    delete tagInfo.events;
  }
  if (tagInfo.children) {
    tagInfo.children.forEach((child) => {
      elm.appendChild(prepareElement(child));
    });
    delete tagInfo.children;
  }
  Object.assign(elm, tagInfo);
  return elm;
}

function addStyle(definition) {
  const style = d.createElement('style');
  style.textContent = Object.keys(definition)
    .map((selector) => `${selector} {\n${flattenStyle(definition[selector], '  ')}\n}`)
    .join('\n');
  d.head.appendChild(style);
}

function flattenStyle(style, indent = '') {
  return Object.keys(style)
    .map((key) => `${indent}${camelToKebab(key)}: ${style[key]};`)
    .join('\n');
}

function camelToKebab(name) {
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
}

function kebabToCamel(name) {
  return name.replace(/-([a-z])/g, (match, p1) => p1.toUpperCase());
}
