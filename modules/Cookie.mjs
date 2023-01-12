const d = document;

function getCookie(key) {
  const m = d.cookie.match(new RegExp(key + '\\s*=\\s*([^;]+)'));
  return !m || !m[1]
    ? null
    : JSON.parse(m[1]);
}

function setCookie(key, obj, expireDate) {
  let cookieStr = key + '=' + JSON.stringify(obj) + ';path=/';
  if (expireDate > 0) {
    expireDate = new Date(new Date().getTime() + 60 * 60 * 24 * expireDate * 1000).toGMTString();
    cookieStr += ';expires=' + expireDate;
  }
  d.cookie = cookieStr;
}

export { getCookie, setCookie };
