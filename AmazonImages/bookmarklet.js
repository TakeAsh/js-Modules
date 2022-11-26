javascript:
(() => {
  if (!location.hostname.endsWith('amazon.co.jp')) { return; }
  location = `https://www.takeash.net/js/AmazonImages/?URL=${encodeURIComponent(location.href)}`;
})();
