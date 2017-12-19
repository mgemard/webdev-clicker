/*
 Le joueur doit produire des lignes de codes. Avec suffisamment de lignes produites il peut programmer des algorithmes pour produire encore plus de lignes de code automatiquement.
 */
// config
const UPDATE_TIME = 0.1; // s
const RENDER_TIME = 0.1; // s
// canvas 
const TICK_Y_COUNT = 3;
const TICK_X_COUNT = 4;
const AXIS_X_START_WIDTH = 100;
const AXIS_Y_START_WIDTH = 10;

// initial data
let lines = 0;
let lineMax = 0;
let lineHistory = [];
const algorithms = [
  { name: "IA optimiste", cooldown: 5, cost: 6, unlocked: false, owned: 0 },
  { name: "IA avancée", cooldown: 2, cost: 20, unlocked: false, owned: 0 },
  { name: "Deep learning algorithm", cooldown: 1, cost: 50, unlocked: false, owned: 0 },
  { name: "Algorithme alien", cooldown: 0.5, cost: 100, unlocked: false, owned: 0 },
  { name: "Algorithme alien avancé", cooldown: 0.1, cost: 500, unlocked: false, owned: 0 },
  { name: "Algorithme post-Singularité", cooldown: 0.05, cost: 3000, unlocked: false, owned: 0 },
  { name: "Algorithme post-Singularité génération 2", cooldown: 0.01, cost: 10000, unlocked: false, owned: 0 }
]

// canvas datas
const canvas = document.getElementById("productionOverTime");
const ctx = canvas.getContext('2d');
const graphMargin = 0;
const originX = graphMargin, originY = canvas.height - graphMargin;
let axisYMax = AXIS_Y_START_WIDTH,
  axisXMax = AXIS_X_START_WIDTH;
let axisYLabelWidth = 0;

// global functions
function update() {
  let produced = 0;
  algorithms.forEach(a => {
    produced += a.owned * UPDATE_TIME / a.cooldown
  })
  lines += produced;


  // regexp ici
}

function render() {
  if (getUnlockableFactoriesCount(algorithms, lines) > 0) {
    // unlock algorithms if we have enough lines to code
    algorithms.forEach(a => {
      a.unlocked = a.unlocked || isUnlockable(a, lines)
    })
    updateTemplate(algorithms);
    showPopup();
  }
  updateLineCount();
  updateCanvas();
}

function showPopup() {
  document.getElementById('popup').className = 'popup open';
}

// user actions
function code() {
  lines++;
  updateLineCount();
}

function develop(name) {
  const a = algorithms.find(a => a.name === name);
  if (a !== null && lines > a.cost) {
    lines -= a.cost;
    a.owned += 1;
    a.cost = Math.ceil(a.cost * 1.5);
    updateTemplate(algorithms);
  }
}

// rendering helpers
function updateLineCount() {
  document.getElementById("count").innerText = String(Math.floor(lines));
}

function updateTemplate() {
  const algorithmsHtml = algorithms
    .filter(a => a.unlocked)
    .map(a => createAlgorithmTemplate(a))
    .join('');
  document.getElementById("productionunits").innerHTML = algorithmsHtml;
}

function createAlgorithmTemplate(algorithm) {
  return `
      <div class="productionunit">
          <div>
            <button onclick="develop('${algorithm.name}')">Programmer une ${algorithm.name}</button>
          </div>
          <div class="line">
            Cost ${algorithm.cost} line to hire.
          </div>
          <div class="line">
          Produces 1 line every ${algorithm.cooldown} seconds.
          </div>
          <div class="line">
          You own <span>${algorithm.owned}</span>.
        </div>
      </div>
`;
}

function updateCanvas() {
  // we first check if the browser has been resized
  if (window.innerWidth < 480) {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerWidth * 16 / 9;
  } else {
    ctx.canvas.width = 854;
    ctx.canvas.height = 480;

  }

  // variables
  let x, y;

  // updade datas
  if (lines !== 0) { lineHistory.push(lines); }
  if (lines > lineMax) { lineMax = lines; }

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // draw background
  ctx.fillStyle = 'dark';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // axis
  drawYAxis();
  // Y axis must be called before x axis to get y-label width
  drawXAxis();
  if (lineHistory.length >= 2) {
    drawLines();
  }
}


function drawXAxis() {

  let currentTime = lineHistory.length;
  if (currentTime > axisXMax) {
    axisXMax = currentTime;
  }

  let axisX = calculateTicks(0, axisXMax, TICK_X_COUNT);
  axisX.forEach((time) => {
    // vertical line
    ctx.beginPath();
    ctx.strokeStyle = 'grey';
    ctx.moveTo(canvas.width - ((axisXMax - time) / axisXMax) * (canvas.width - axisYLabelWidth), canvas.height - graphMargin);
    ctx.lineTo(canvas.width - ((axisXMax - time) / axisXMax) * (canvas.width - axisYLabelWidth), 0);
    ctx.stroke();
  });
}

function drawYAxis() {
  if (lineMax > 10) {
    axisYMax = lineMax;
  }
  let axisY = calculateTicks(0, axisYMax, TICK_Y_COUNT);

  ctx.font = "20px Arial";
  ctx.fillStyle = 'white';
  axisYLabelWidth = ctx.measureText(axisY[axisY.length - 1]).width;
  // getting the height of the text is not quite as easy, so
  // the drawback is that the label is not aligned
  axisY.forEach((line) => {
    // Y axis label
    ctx.fillText(line, 0,
      (canvas.height - graphMargin) * (axisYMax - line) / axisYMax);
    // horizontal line
    ctx.beginPath();
    ctx.strokeStyle = 'grey';
    ctx.moveTo(axisYLabelWidth, (canvas.height - graphMargin) * (axisYMax - line) / axisYMax);
    ctx.lineTo(canvas.width, (canvas.height - graphMargin) * (axisYMax - line) / axisYMax);
    ctx.stroke();
  });
}

// Calculate n ticks for an arbitrary range with min x and max y
// Return an array containing the intervals
// calculateTicks(1, 12, 5); // [2, 4, 6, 8, 10, 12]
// calculateTicks(0, 12, 4); // [0, 5, 10]
function calculateTicks(min, max, tickCount) {
  var span = max - min,
    step = Math.pow(10, Math.floor(Math.log(span / tickCount) / Math.LN10)),
    err = tickCount / span * step;

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;

  // Round start and stop values to step interval.
  var tstart = Math.ceil(min / step) * step,
    tstop = Math.floor(max / step) * step + step * .5,
    ticks = [],
    x;

  // now generate ticks
  for (i = tstart; i < tstop; i += step) {
    ticks.push(i);
  }
  return ticks;
}

function drawLines() {
  let currentTime = lineHistory.length;
  console.log(currentTime);
  if (currentTime < AXIS_X_START_WIDTH) {
    ctx.beginPath();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 5;
    ctx.moveTo(canvas.width - (canvas.width - axisYLabelWidth) * (AXIS_X_START_WIDTH - 0) / (AXIS_X_START_WIDTH),
      (canvas.height - graphMargin) * (axisYMax - lineHistory[0]) / (axisYMax));
    for (let i = 1; i < lineHistory.length; i++) {
      ctx.lineTo(canvas.width - (canvas.width - axisYLabelWidth) * (AXIS_X_START_WIDTH - i) / (AXIS_X_START_WIDTH),
        (canvas.height - graphMargin) * (axisYMax - lineHistory[i]) / (axisYMax));

    }
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 5;
    ctx.moveTo(canvas.width - (canvas.width - axisYLabelWidth) * (currentTime - 0) / (currentTime),
      (canvas.height - graphMargin) * (axisYMax - lineHistory[0]) / (axisYMax));
    for (let i = 1; i < lineHistory.length; i++) {
      ctx.lineTo(canvas.width - (canvas.width - axisYLabelWidth) * (currentTime - i) / (currentTime),
        (canvas.height - graphMargin) * (axisYMax - lineHistory[i]) / (axisYMax));
    }
    ctx.stroke();
  }
}

// business logic
function getUnlockableFactoriesCount(algorithms, lines) {
  return algorithms.filter(a => isUnlockable(a, lines)).length;
}

function isUnlockable(algorithm, lines) {
  return !algorithm.unlocked && algorithm.cost < lines;
}

// start
setInterval(render, RENDER_TIME * 1000);
setInterval(update, UPDATE_TIME * 1000);