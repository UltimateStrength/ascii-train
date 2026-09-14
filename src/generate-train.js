const fs = require('fs');
const path = require('path');

const CONFIG = {
  outputDir: 'output',
  outputFile: 'train.svg',

  width: 720,
  height: 130,

  trainSpeed: 5,
  pauseDuration: 3,

  accentColor: '#58a6ff',

  // Quantas composições diferentes serão criadas
  compositions: 30,

  minWagons: 5,
  maxWagons: 8,

  lineHeight: 10,
  charWidth: 6.5,

  wagonGap: -15,

  railY: 98,

  smokeParticles: 5,
};

const PALETTE = {
  ink: '#f0f6fc',
  accent: CONFIG.accentColor,
  rail: '#6b7280',
  smoke: '#9ca3af',
};

const ACCENT_CHARS = new Set([
  '[',
  ']',
  'o',
  'O',
  '#',
]);

const SMOKE_CHARS = [
  '.',
  'o',
  'O',
  '@',
];

const LOCOMOTIVES = [
  {
    name: 'classic',

    smokeX: 6,
    smokeY: -48,

    art: [
      '     .--.       ',
      '    / __ \\      ',
      '   | () |==[###]',
      '   |_____| [###] ',
      '  _/o----o--o---',
      ' [==============]',
    ],
  },

  {
    name: 'streamline',

    smokeX: 6,
    smokeY: -48,

    art: [
      '     ___        ',
      '    /   \\       ',
      '   | ###|==[##]',
      '   |___/ [###] ',
      '  _/o----o--o---',
      ' [==============]',
    ],
  },

  {
    name: 'boxcab',

    smokeX: 6,
    smokeY: -48,

    art: [
      '    .------.     ',
      '    | [] []|     ',
      '    | [] []|==[##]',
      '    |______| [##]',
      '  _/o----o--o---',
      ' [==============]',
    ],
  },

  {
    name: 'tank',

    smokeX: 7,
    smokeY: -48,

    art: [
      '      .--.       ',
      '     ( oo )      ',
      '   __|_____|==[##]',
      '  /  o--o--o--o ',
      ' [==============]',
      '  ^^^^ ^^^^ ^^^ ',
    ],
  },
];

const WAGONS = [
  {
    name: 'boxcar',

    art: [
      ' .--------. ',
      ' | []  [] | ',
      ' | []  [] | ',
      ' |_________| ',
      '  o----o----o ',
    ],
  },

  {
    name: 'flatbed',

    art: [
      '  __________ ',
      ' |__________|',
      ' | [####]   |',
      '  o----o----o ',
    ],
  },

  {
    name: 'tanker',

    art: [
      '  .------.   ',
      ' /        \\  ',
      '|  ######  | ',
      ' \\________/  ',
      '  o----o----o ',
    ],
  },

  {
    name: 'caboose',

    art: [
      '   .----.    ',
      '  / [] []\\   ',
      ' |  [] [] |  ',
      ' |_________|  ',
      '  o----o----o ',
    ],
  },

  {
    name: 'hopper',

    art: [
      ' .----------.',
      ' | [] [] [] |',
      ' |___||___| |',
      '     \\/  \\/  ',
      '  o----o----o ',
    ],
  },
];

function padEnd(value, length) {
  return value.padEnd(length, ' ');
}

function chooseRandom(items) {
  return items[
    Math.floor(Math.random() * items.length)
  ];
}

function randomInt(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeRows(art) {
  const width = Math.max(
    ...art.map((row) => row.length)
  );

  return art.map((row) =>
    padEnd(row, width)
  );
}

function splitByAccent(row) {
  let base = '';
  let accent = '';

  for (const ch of row) {
    if (ACCENT_CHARS.has(ch)) {
      base += ' ';
      accent += ch;
    } else {
      base += ch;
      accent += ' ';
    }
  }

  return {
    base,
    accent,
  };
}

function renderRowsToSvg(rows, x, bottomY) {
  const fontProps =
    'font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" ' +
    'font-size="10" ' +
    'letter-spacing="0"';

  const baseTspans = [];
  const accentTspans = [];

  const topY =
    bottomY -
    (rows.length - 1) *
      CONFIG.lineHeight;

  rows.forEach((row, i) => {
    const { base, accent } =
      splitByAccent(row);

    const len =
      row.length *
      CONFIG.charWidth;

    const y =
      topY +
      i * CONFIG.lineHeight;

    baseTspans.push(
      `<tspan x="${x}" y="${y}" textLength="${len}" lengthAdjust="spacing">${escapeXml(base)}</tspan>`
    );

    accentTspans.push(
      `<tspan x="${x}" y="${y}" textLength="${len}" lengthAdjust="spacing">${escapeXml(accent)}</tspan>`
    );
  });

  const baseText =
    `<text fill="${PALETTE.ink}" ` +
    `xml:space="preserve" ${fontProps}>` +
    baseTspans.join('') +
    `</text>`;

  const accentText =
    `<text fill="${PALETTE.accent}" ` +
    `xml:space="preserve" ${fontProps}>` +
    accentTspans.join('') +
    `</text>`;

  return `${baseText}\n${accentText}`;
}

function makeSmoke() {
  const particles = [];

  for (
    let i = 0;
    i < CONFIG.smokeParticles;
    i += 1
  ) {
    particles.push({
      x: randomInt(-3, 3),
      y: randomInt(-2, 2),
      char: chooseRandom(SMOKE_CHARS),
      delay: i * 0.32,
      duration: randomInt(14, 21) / 10,
      drift: randomInt(-14, -7),
    });
  }

  return particles;
}

function renderSmokeToSvg(
  particles,
  x,
  y,
  prefix
) {
  return particles
    .map((particle, i) => {
      return (
        `<text ` +
        `x="${x + particle.x}" ` +
        `y="${y + particle.y}" ` +
        `fill="${PALETTE.smoke}" ` +
        `class="smoke-particle ${prefix}-${i}" ` +
        `style="` +
        `--smoke-drift:${particle.drift}px;` +
        `animation-delay:${particle.delay}s;` +
        `animation-duration:${particle.duration}s"` +
        `>` +
        `${escapeXml(particle.char)}` +
        `</text>`
      );
    })
    .join('\n');
}

function createComposition(index) {
  const locomotive =
    chooseRandom(LOCOMOTIVES);

  const wagonCount = randomInt(
    CONFIG.minWagons,
    CONFIG.maxWagons
  );

  const selectedWagons =
    Array.from(
      { length: wagonCount },
      () => chooseRandom(WAGONS)
    );

  const smoke = makeSmoke();

  const locoRows =
    normalizeRows(locomotive.art);

  const wagonRowSets =
    selectedWagons.map((wagon) =>
      normalizeRows(wagon.art)
    );

  const trainBottomY =
    CONFIG.railY - 5;

  const locomotiveX = 18;

  let cursorX = locomotiveX;

  const parts = [];

  // LOCOMOTIVA
  parts.push(
    renderRowsToSvg(
      locoRows,
      cursorX,
      trainBottomY
    )
  );

  // FUMAÇA
  const smokeX =
    locomotiveX +
    locomotive.smokeX;

  const smokeY =
    trainBottomY +
    locomotive.smokeY;

  parts.push(
    `<g class="smoke">` +
    renderSmokeToSvg(
      smoke,
      smokeX,
      smokeY,
      `smoke-${index}`
    ) +
    `</g>`
  );

  cursorX +=
    Math.max(
      ...locoRows.map(
        (row) => row.length
      )
    ) *
      CONFIG.charWidth;

  cursorX += CONFIG.wagonGap;

  // VAGÕES
  wagonRowSets.forEach((rows) => {
    parts.push(
      renderRowsToSvg(
        rows,
        cursorX,
        trainBottomY
      )
    );

    cursorX +=
      Math.max(
        ...rows.map(
          (row) => row.length
        )
      ) *
        CONFIG.charWidth;

    cursorX += CONFIG.wagonGap;
  });

  const totalTrainWidth =
    cursorX - locomotiveX;

  return {
    svg: parts.join('\n'),
    width: totalTrainWidth,
  };
}

function buildComposition() {
  const totalCycle =
    CONFIG.trainSpeed +
    CONFIG.pauseDuration;

  const compositions = [];

  let maxTrainWidth = 0;

  /*
   * Cria várias composições aleatórias.
   *
   * Cada uma será usada em uma passagem diferente.
   */
  for (
    let i = 0;
    i < CONFIG.compositions;
    i += 1
  ) {
    const composition =
      createComposition(i);

    compositions.push(composition);

    maxTrainWidth = Math.max(
      maxTrainWidth,
      composition.width
    );
  }

  const trainStart =
    CONFIG.width + 30;

  const trainEnd =
    -(maxTrainWidth + 50);

  const animationDuration =
    totalCycle *
    CONFIG.compositions;

  const animationStep =
    100 /
    CONFIG.compositions;

  const trainGroups =
    compositions
      .map((composition, index) => {
        const start =
          index *
          animationStep;

        const end =
          start +
          (CONFIG.trainSpeed /
            totalCycle) *
            animationStep;

        return `
    <g class="train train-${index}">
      ${composition.svg}

      <animateTransform
        attributeName="transform"
        type="translate"
        values="${trainStart};${trainStart};${trainEnd};${trainEnd}"
        keyTimes="0;${start / 100};${end / 100};1"
        dur="${animationDuration}s"
        repeatCount="indefinite"
      />
    </g>
`;
      })
      .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${CONFIG.width}"
  height="${CONFIG.height}"
  viewBox="0 0 ${CONFIG.width} ${CONFIG.height}"
  role="img"
  aria-label="Animated ASCII train"
>

  <title>Animated ASCII Train</title>

  <style>

    .smoke-particle {
      opacity: 0;

      animation:
        smoke-rise
        1.8s
        ease-out
        infinite;
    }

    @keyframes smoke-rise {

      0% {
        opacity: 0;

        transform:
          translate(0, 0)
          scale(0.8);
      }

      20% {
        opacity: 0.7;
      }

      100% {
        opacity: 0;

        transform:
          translate(var(--smoke-drift), -18px)
          scale(1.35);
      }
    }

  </style>

  <!--
    TRILHO FIXO
    O trem passa por cima dele.
  -->

  <g class="rail">

    <line
      x1="0"
      y1="${CONFIG.railY}"
      x2="${CONFIG.width}"
      y2="${CONFIG.railY}"
      stroke="${PALETTE.rail}"
      stroke-width="1"
      stroke-dasharray="3 4"
      opacity="0.65"
    />

  </g>

  <!--
    VÁRIAS COMPOSIÇÕES ALEATÓRIAS.
    Apenas uma delas está passando por vez.
  -->

  ${trainGroups}

</svg>
`;
}

function main() {
  const outputDir =
    path.join(
      __dirname,
      '..',
      CONFIG.outputDir
    );

  fs.mkdirSync(
    outputDir,
    {
      recursive: true,
    }
  );

  const svg =
    buildComposition();

  fs.writeFileSync(
    path.join(
      outputDir,
      CONFIG.outputFile
    ),
    svg
  );

  console.log(
    `Generated ${CONFIG.outputFile} with ${CONFIG.compositions} random train compositions.`
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  buildComposition,
  CONFIG,
};