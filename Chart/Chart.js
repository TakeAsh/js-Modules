import 'https://cdn.jsdelivr.net/npm/chart.js'
import { prepareElement } from '../modules/PrepareElement.mjs';

const n = 100;
const seeds = [0.4, 0.45, 0.1, 0.95,];
const interval = 500;
const dataBernoulli = seeds.map((seed, index) => {
  return {
    label: seed,
    data: BernoulliSet(seed, n),
    borderColor: toHSL(index, 0.5),
    stepped: true,
  };
});
const ctx = document.getElementById('chartBernoulli');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: range(n),
    datasets: dataBernoulli,
  },
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Bernoulli',
        font: {
          size: 24,
        },
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'n',
          font: {
            size: 18,
            weight: 'bold',
          },
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 5
        },
      },
      y: {
        title: {
          display: true,
          text: 'Xn',
          font: {
            size: 18,
            weight: 'bold',
          },
        },
        min: 0,
        max: 1,
        ticks: {
          stepSize: 0.1,
        },
      },
    },
  },
});
const sampleBernoulli = document.getElementById('sampleBernoulli');
sampleBernoulli.style.gridTemplateColumns = range(seeds.length).map(_ => '1fr').join(' ');
const lampsBernoulli = seeds.map((seed, index) => {
  const lamp = prepareElement({
    tag: 'div',
    dataset: {
      index: index,
      lightness: seed,
    },
    classes: ['lamp'],
    children: [
      {
        tag: 'span',
        textContent: seed,
      },
    ],
    style: {
      backgroundColor: toHSL(index, 0.5),
    },
  });
  sampleBernoulli.appendChild(lamp);
  return lamp;
});
setInterval(() => lampsBernoulli.forEach(lamp => {
  const lightness = Bernoulli(parseFloat(lamp.dataset.lightness));
  lamp.dataset.lightness = lightness;
  lamp.style.backgroundColor = toHSL(parseInt(lamp.dataset.index), lightness);
}), interval);

function range(n) {
  return Array.from({ length: n }, (_, i) => (i));
}
function toHSL(n, lightness) {
  return `hsl(${360 * n / seeds.length}deg 100% ${100 * lightness}%)`;
}
function BernoulliSet(seed, n) {
  return range(n).reduce(
    (acc, index) => {
      const next = index == 0 ? seed // n = 0
        : Bernoulli(acc[index - 1]); // n = 1,2,3,...
      acc.push(next);
      return acc;
    },
    []
  );
}
function Bernoulli(x) {
  return x < 0.05 || 0.95 < x ? Math.random() :
    x <= 0.5 ? x + 2 * x * x : // 0.05 <= x <= 0.5
      x - 2 * (1 - x) * (1 - x); // 0.5 < x <= 0.95
}
