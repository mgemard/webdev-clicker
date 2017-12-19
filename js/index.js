/*
 Le joueur doit produire des lignes de codes. Avec suffisamment de lignes produites il peut programmer des algorithmes pour produire encore plus de lignes de code automatiquement.
 */
// config
const UPDATE_TIME = 0.1; // s
const RENDER_TIME = 0.1; // s

// initial data
let drawCanvas = false;
let lines = 0;
let productions = [];
let currentProd;
const algorithms = [
  { name: "IA optimiste", cooldown: 5, cost: 6, unlocked: false, owned: 0 },
  { name: "IA avancée", cooldown: 2, cost: 20, unlocked: false, owned: 0 },
  { name: "Deep learning algorithm", cooldown: 1, cost: 50, unlocked: false, owned: 0 },
  { name: "Algorithme alien", cooldown: 0.5, cost: 100, unlocked: false, owned: 0 },
  { name: "Algorithme alien avancé", cooldown: 0.1, cost: 500, unlocked: false, owned: 0 },
  { name: "Algorithme post-Singularité", cooldown: 0.05, cost: 3000, unlocked: false, owned: 0 },
  { name: "Algorithme post-Singularité génération 2", cooldown: 0.01, cost: 10000, unlocked: false, owned: 0 }
]

// global functions
function update() {
  let produced = 0;
  algorithms.forEach(a => {
    produced += a.owned * UPDATE_TIME / a.cooldown
  })
  lines += produced;

  if (currentProd > 0) {
    if (produced !== currentProd) {
      drawCanvas = true;
      productions.push(produced);
    }
  }
  currentProd = produced;

  
  // regexp ici
}

function render() {
  if (getUnlockableFactoriesCount(algorithms, lines) > 0) {
    // unlock algorithms if we have enough lines to code
    algorithms.forEach(a => {
      a.unlocked = a.unlocked || isUnlockable(a, lines)
    })
    updateTemplate(algorithms)
    showPopup()
  }
  updateLineCount();
  updateCanvas();
}

function showPopup() {
  document.getElementById('popup').className = 'popup open';
}

// user actions
function code() {
  lines++
  updateLineCount()
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
    .join('')
  document.getElementById("productionunits").innerHTML = algorithmsHtml;
}

function createAlgorithmTemplate(algorithm) {
  return `
      <div class="productionunit">
          <div>
            <button onclick="develop('${algorithm.name}')">Programmer un·e ${algorithm.name}</button>
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
  const c = document.getElementById("productionOverTime");
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  const originX = 30, originY = 290
  let x, y, i = 0;

  // background
  ctx.fillStyle = 'dark';
  ctx.fillRect(0, 0, 480, 320);
  // axis
  // horizontal
  ctx.beginPath(); ctx.strokeStyle = 'grey';
  ctx.moveTo(30, originY - 30); ctx.lineTo(450, originY - 30); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(30, c.height / 2); ctx.lineTo(450, c.height / 2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(30, 60); ctx.lineTo(450, 60); ctx.stroke();
  // vertical
  ctx.beginPath();
  ctx.moveTo(originX + 50, 30); ctx.lineTo(originX + 50, originY); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(180, 30); ctx.lineTo(180, originY); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(290, 30); ctx.lineTo(290, originY); ctx.stroke();
  ctx.moveTo(400, 30); ctx.lineTo(400, originY); ctx.stroke();


  // add axis labels
  ctx.font = "20px";
  ctx.strokeText("Lines", 20, 30);
  ctx.strokeText("Time", 420, 300);
  // draw function


  // we draw production
  console.log(productions[productions.length - 1]);
  const size = productions.length;

  if (drawCanvas) {
    //   console.log((0) * c.width / size, -320 + productions[0] * c.height / currentProd);
    //   console.log((0 + 1) * c.width / size, -320 + productions[0 + 1] * c.height / currentProd);

    for (let i = 1; i < size; i++) {
      ctx.beginPath(); ctx.strokeStyle = 'green';
      console.log((i - 1) * c.width / size, -320 + productions[i - 1] * c.height / currentProd);
      console.log((i) * c.width / size, -320 + productions[i] * c.height / currentProd);
      ctx.moveTo((i - 1) * c.width / size, -320 + productions[i - 1] * c.height / currentProd);
      ctx.lineTo((i) * c.width / size, -320 + productions[i] * c.height / currentProd);
      ctx.stroke();
    }

  }
}

// business logic
function getUnlockableFactoriesCount(algorithms, lines) {
  return algorithms.filter(a => isUnlockable(a, lines)).length
}

function isUnlockable(algorithm, lines) {
  return !algorithm.unlocked && algorithm.cost < lines
}

// start
setInterval(render, RENDER_TIME * 1000)
setInterval(update, UPDATE_TIME * 1000)