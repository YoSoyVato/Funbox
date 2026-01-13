const content = document.getElementById("content");

// ======================
// STORAGE
// ======================
const getUser = () => localStorage.getItem("funbox_user");
const getGames = () => JSON.parse(localStorage.getItem("funbox_games")) || [];

// ======================
// LOGIN
// ======================
loginBtn.onclick = () => {
  content.innerHTML = `
    <h2>👤 Login</h2>
    <input id="u" placeholder="Usuario"><br><br>
    <button id="go">Entrar</button>
  `;
  go.onclick = () => {
    if (!u.value) return;
    localStorage.setItem("funbox_user", u.value);
    alert("Bienvenido " + u.value);
  };
};

// ======================
// ENGINE STATE
// ======================
let canvas, ctx;
let blocks = [];
let history = [];
let future = [];

let cam = { x: 0, y: 0 };
let mode = "place";
let engineMode = "edit";

const SIZE = 40;

// ======================
// EDITOR
// ======================
function startEditor(game = null) {
  blocks = game?.map ? JSON.parse(JSON.stringify(game.map)) : [];
  history = [];

  content.innerHTML = `
    <div class="editor-ui">
      <h3>🧱 Funbox</h3>

      <b>Herramientas</b>
      <button id="toolPlace">🧱 Colocar</button>
      <button id="toolDelete">❌ Borrar</button>
      <button id="toolMove">✋ Cámara</button>

      <hr>

      <b>Modo</b>
      <button id="modeEdit">✏️ Editar</button>
      <button id="modePlay">🎮 Jugar</button>

      <hr>

      <button id="save">💾 Guardar</button>
      <button id="exit">🚪 Salir</button>
    </div>

    <canvas id="canvas" width="1000" height="520"></canvas>
  `;

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.oncontextmenu = e => e.preventDefault();
  canvas.addEventListener("mousedown", mouseDown);
  window.onkeydown = keyControl;

  bindUI();
  requestAnimationFrame(loop);
}

// ======================
// UI
// ======================
function bindUI() {
  toolPlace.onclick = () => setMode("place");
  toolDelete.onclick = () => setMode("delete");
  toolMove.onclick = () => setMode("move");

  modeEdit.onclick = () => engineMode = "edit";
  modePlay.onclick = () => engineMode = "play";

  save.onclick = saveGame;
  exit.onclick = () => location.reload();

  setMode("place");
}

function setMode(m) {
  mode = m;
  document.querySelectorAll(".editor-ui button")
    .forEach(b => b.classList.remove("active"));
  document.getElementById("tool" + m.charAt(0).toUpperCase() + m.slice(1))?.classList.add("active");
}

// ======================
// INPUT
// ======================
function grid(e) {
  return {
    x: Math.floor((e.offsetX + cam.x) / SIZE),
    y: Math.floor((e.offsetY + cam.y) / SIZE)
  };
}

function mouseDown(e) {
  if (engineMode !== "edit") return;

  const { x, y } = grid(e);
  saveState();

  if (mode === "place" && e.button === 0) {
    let z = 0;
    while (blocks.find(b => b.x === x && b.y === y && b.z === z)) z++;
    blocks.push({ x, y, z });
  }

  if (mode === "delete" && e.button === 0) {
    const stack = blocks.filter(b => b.x === x && b.y === y);
    const top = Math.max(-1, ...stack.map(b => b.z));
    blocks = blocks.filter(b => !(b.x === x && b.y === y && b.z === top));
  }
}

function keyControl(e) {
  if (e.ctrlKey && e.key === "z") undo();
  if (e.ctrlKey && e.key === "y") redo();

  if (e.key === "w") cam.y -= 20;
  if (e.key === "s") cam.y += 20;
  if (e.key === "a") cam.x -= 20;
  if (e.key === "d") cam.x += 20;
}

// ======================
// UNDO / REDO
// ======================
function saveState() {
  history.push(JSON.stringify(blocks));
  future = [];
}

function undo() {
  if (!history.length) return;
  future.push(JSON.stringify(blocks));
  blocks = JSON.parse(history.pop());
}

function redo() {
  if (!future.length) return;
  history.push(JSON.stringify(blocks));
  blocks = JSON.parse(future.pop());
}

// ======================
// RENDER
// ======================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GRID
  ctx.strokeStyle = "#222";
  for (let x = -cam.x % SIZE; x < canvas.width; x += SIZE) {
    for (let y = -cam.y % SIZE; y < canvas.height; y += SIZE) {
      ctx.strokeRect(x, y, SIZE, SIZE);
    }
  }

  blocks.sort((a, b) => a.z - b.z).forEach(b => {
    ctx.fillStyle = `hsl(${200 - b.z * 8},80%,55%)`;
    ctx.fillRect(
      b.x * SIZE - cam.x,
      b.y * SIZE - cam.y - b.z * 10,
      SIZE - 2,
      SIZE - 2
    );
  });

  requestAnimationFrame(loop);
}

// ======================
// SAVE / PLAY
// ======================
function saveGame() {
  const name = prompt("Nombre del juego:");
  if (!name) return;

  let games = getGames();
  games = games.filter(g => g.name !== name);
  games.push({ name, author: getUser(), map: blocks });

  localStorage.setItem("funbox_games", JSON.stringify(games));
  alert("Juego guardado 🚀");
}

// ======================
// BUTTONS
// ======================
createBtn.onclick = () => {
  if (!getUser()) return alert("Inicia sesión");
  startEditor();
};

playBtn.onclick = () => {
  const games = getGames();
  if (!games.length) return content.innerHTML = "<h2>No hay juegos</h2>";

  content.innerHTML = "<h2>🎮 Juegos</h2>";
  games.forEach(g => {
    const b = document.createElement("button");
    b.textContent = `${g.name} - ${g.author}`;
    b.onclick = () => startEditor(g);
    content.appendChild(b);
    content.appendChild(document.createElement("br"));
  });
};


