﻿import WorkerManager from '../modules/WorkerManager.mjs';
import { downloadMedia } from '../modules/Util.mjs';

const uriNoImage = 'https://images-na.ssl-images-amazon.com/images/G/09/nav2/dp/no-image-no-ciu.gif';
const fixShots = [
  { Name: 'Main', Key: 'MAIN' },
  { Name: 'Top', Key: 'TOPP' },
  { Name: 'Bottom', Key: 'BOTT' },
  { Name: 'Left', Key: 'LEFT' },
  { Name: 'Right', Key: 'RGHT' },
  { Name: 'Front', Key: 'FRNT' },
  { Name: 'Back', Key: 'BACK' },
];
const variableShots = ['PT', 'IN'];
const shots = makeShots();
const threads = 48;
const associateTag = 'takeash68k-22';
const d = document;
const buttonCheck = d.getElementById('buttonCheck');
const inputUrl = d.getElementById('inputUrl');
const divAmazonLink = d.getElementById('divAmazonLink');
const divResult = d.getElementById('divResult');
const olResult = d.getElementById('olResult');
const selectSample = d.getElementById('selectSample');

buttonCheck.addEventListener(
  'click',
  async (event) => {
    divResult.innerHTML = null;
    olResult.innerHTML = null;
    const asin = getAsin();
    if (!asin) {
      alert('Invalid URL');
      return;
    }
    showAmazonLink(asin);
    const result = await scanShots(asin);
    console.log(result);
    showResult(asin, result);
  }
);
inputUrl.addEventListener(
  'focus',
  (event) => { event.target.select(); }
);
inputUrl.addEventListener(
  'keyup',
  (event) => {
    if (event.key == 'Enter') { buttonCheck.click(); }
  }
);
selectSample.addEventListener(
  'change',
  (event) => {
    inputUrl.value = !selectSample.value
      ? ''
      : `https://www.amazon.co.jp/dp/${selectSample.value}/`;
  }
);

function getAsin() {
  const m = d.getElementById('inputUrl').value
    .match(/\b(dp|ASIN|product|product-description|samples)[\/=]([0-9A-Z]+)/);
  return !m || !m[2]
    ? null
    : m[2];
}

async function showAmazonLink(asin) {
  divAmazonLink.innerHTML = null;
  const a = d.createElement('a');
  a.href = `https://www.amazon.co.jp/dp/${asin}/?tag=${associateTag}`;
  a.target = '_blank';
  a.textContent = asin;
  divAmazonLink.appendChild(a);
}

function range(x) {
  return Array.from({ length: x }, (_, i) => (i));
}

function makeShots() {
  const shots = [];
  shots.push(...fixShots);
  variableShots.forEach((type) => {
    range(99).forEach((i) => {
      const shot = type + `0${i + 1}`.slice(-2);
      shots.push({ Name: shot, Key: shot });
    });
  });
  return shots;
}

async function scanShots(asin) {
  const wm = new WorkerManager();
  wm.source = () => {
    const sizes = [
      { Name: 'Large', Key: 'RM' },
      { Name: 'Medium', Key: 'L' },
      { Name: 'Small', Key: 'M' },
    ];
    let isCancelled = false;
    self.addEventListener(
      'message',
      async (event) => {
        if (event.data == 'cancel') {
          isCancelled = true;
          return;
        }
        const id = event.data.id;
        const shots = event.data.data;
        const asin = event.data.option.asin;
        for (const shot of shots) {
          if (isCancelled) {
            postMessage({ type: 'Error', message: `worker[${id}]: cancelled`, });
            return;
          }
          for (const size of sizes) {
            const uri = `https://images-na.ssl-images-amazon.com/images/P/${asin}.09.${shot.Key}._SC${size.Key}ZZZZZZ_.jpg`;
            const response = await fetch(uri, { method: 'HEAD', });
            if (!response.ok) {
              const message = await response.text();
              postMessage({ type: 'Error', message: `worker[${id}]: ${message}`, });
              return;
            } else {
              if (response.headers.get('content-type') == 'image/jpeg') {
                shot.title = `${shot.Name}_${size.Name}`;
                shot.uri = uri;
                break;
              }
            }
          }
          postMessage({
            type: 'Progress',
            progress: shot,
          });
        }
        postMessage({
          type: 'Completed',
          message: `worker[${id}]: completed`,
          result: shots,
        });
      }
    );
  };
  let count = 0;
  let isCancelled = false;
  wm.reportProgress = (progress) => {
    if (isCancelled) { return; }
    if (progress.title) {
      console.log(progress);
    }
    divResult.textContent = `${Math.floor(100 * (++count) / shots.length)}%`;
  };
  const result = await wm.run(shots, threads, { asin: asin })
    .catch((err) => {
      wm.cancelAll();
      isCancelled = true;
      divResult.textContent = err;
    });
  wm.dispose();
  return result.reduce(
    (acc, cur) => acc.concat(cur.filter((shot) => shot.title)),
    []
  );
}

function showResult(asin, result) {
  divResult.innerHTML = null;
  if (!result.length) {
    const img = d.createElement('img');
    img.src = uriNoImage;
    divResult.appendChild(img);
  }
  result.forEach((shot, index) => {
    const h2 = d.createElement('h2');
    h2.id = shot.title;
    const buttonPrev = d.createElement('button');
    buttonPrev.textContent = '<';
    buttonPrev.title = 'Prev';
    buttonPrev.addEventListener(
      'click',
      (event) => { location = `#${result[(index + result.length - 1) % result.length].title}`; }
    );
    h2.appendChild(buttonPrev);
    h2.appendChild(d.createTextNode(' '));
    const buttonNext = d.createElement('button');
    buttonNext.textContent = '>';
    buttonNext.title = 'Next';
    buttonNext.addEventListener(
      'click',
      (event) => { location = `#${result[(index + 1) % result.length].title}`; }
    );
    h2.appendChild(buttonNext);
    h2.appendChild(d.createTextNode(' '));
    const buttonDownload = d.createElement('button');
    buttonDownload.textContent = 'DL';
    buttonDownload.title = 'Download';
    buttonDownload.addEventListener(
      'click',
      (event) => { downloadMedia(shot.uri, `${asin}_${shot.title}.jpg`); }
    );
    h2.appendChild(buttonDownload);
    h2.appendChild(d.createTextNode(' '));
    h2.appendChild(d.createTextNode(shot.title));
    divResult.appendChild(h2);
    const img = d.createElement('img');
    img.title = shot.title;
    img.src = shot.uri;
    img.classList.add('fitWidth');
    divResult.appendChild(img);
    const li = d.createElement('li');
    const aToC = d.createElement('a');
    aToC.href = `#${shot.title}`;
    aToC.textContent = shot.title;
    li.appendChild(aToC);
    olResult.appendChild(li);
  });
}
