const d = document;

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

export { getNodesByXpath, downloadMedia };
