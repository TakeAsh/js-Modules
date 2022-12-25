const d = document;

/**
 * Copy text to clipboard.
 * @param {string} text
 * @return {boolean} true:success false:failure
 */
function copyToClipboard(text) {
  if (!d.execCommand) { return false; } /* execCommand is deprecated */
  const textarea = d.createElement('textarea');
  textarea.textContent = text;
  d.body.appendChild(textarea);
  textarea.select();
  d.execCommand('copy');
  d.body.removeChild(textarea);
  return true;
}

/**
 * Write text to clipboard.
 * @param {string} text
 * @return {boolean} true:success false:failure
 */
function writeToClipboard(text) {
  if (!navigator.clipboard.writeText) { return false; }
  return navigator.permissions.query({ name: 'clipboard-write' })
    .then((result) => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.clipboard.writeText(text)
          .then(
            () => { return true; },
            (err) => {
              console.log(err);
              alert('Document is not focused.\nClick document and try again.');
              return false;
            }
          );
      }
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

export { copyToClipboard, writeToClipboard };
