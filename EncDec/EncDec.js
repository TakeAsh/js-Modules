const d = document;
const txtSrc = d.getElementById('txtSrc');
const txtDst = d.getElementById('txtDst');

function EncURI() {
  txtDst.value = encodeURI(txtSrc.value);
}

function DecURI() {
  txtDst.value = txtSrc.value.replace(
    /((%[8-9A-Fa-f][0-9A-Fa-f])*%[0-9A-Fa-f]{2})/g,
    (whole, p1) => decodeURI(p1)
  );
}

function EncURIC() {
  txtDst.value = encodeURIComponent(txtSrc.value);
}

function DecURIC() {
  txtDst.value = txtSrc.value.replace(
    /((%[8-9A-Fa-f][0-9A-Fa-f])*%[0-9A-Fa-f]{2})/g,
    (whole, p1) => decodeURIComponent(p1)
  );
}

function Cpy() {
  txtSrc.value = txtDst.value;
}
