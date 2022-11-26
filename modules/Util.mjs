const d = document;

/**
 * Get nodes specified by XPath as array instead of iterator.
 * @param {string} xpath
 * @param {node} context
 * @return {node[]} 
 */
function getNodesByXpath(xpath, context) {
  const itr = d.evaluate(
    xpath,
    context || d,
    null,
    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    null
  );
  const nodes = [];
  let node = null;
  while (node = itr.iterateNext()) {
    nodes.push(node);
  }
  return nodes;
}

/**
 * Download media from cross-origin site.
 * This function will fail when cross-origin site doesn't allow access.
 * @param {string} uri
 * @param {string} filename
 */
async function downloadMedia(uri, filename) {
  if (!filename) {
    filename = (uri.match(/([^/]+)$/))[1];
  }
  const response = await fetch(uri, {
    headers: new Headers({
      'Origin': location.origin,
    }),
    mode: 'cors',
  });
  const blob = await response.blob();
  const dataUrl = window.URL.createObjectURL(blob);
  const link = d.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
  window.URL.revokeObjectURL(dataUrl);
}

/**
 * Convert location.search into a hash.
 * @return {*} Query as a hash. Null when location.search is not set.
 */
function getQuery() {
  if (!location.search) { return null; }
  const decode = (x) => decodeURIComponent(x).trim();
  return location.search.split(/[\?&]/)
    .filter((pair) => pair)
    .map((pair) => pair.split(/=/))
    .reduce(
      (acc, cur) => {
        acc[decode(cur[0])] = !cur[1]
          ? ''
          : decode(cur[1]);
        return acc;
      },
      {}
    );
}

export { getNodesByXpath, downloadMedia, getQuery };
