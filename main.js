// ======================
// ELEMENTOS
// ======================
const content = document.getElementById("content");

const playBtn = document.getElementById("playBtn");
const createBtn = document.getElementById("createBtn");
const loginBtn = document.getElementById("loginBtn");

// ======================
// STORAGE
// ======================
const getUser = () => localStorage.getItem("funbox_user");
const getGames = () =>
  JSON.parse(localStorage.getItem("funbox_games")) || [];

// ======================
// LOGIN
// ======================
loginBtn.onclick = () => {
  content.innerHTML = `
    <h2>👤 Login</h2>
    <input id="u" placeholder="Usuario"><br><br>
    <input id="p" type="password" placeholder="Contraseña"><br><br>
    <button id="go">Entrar</button>
  `;

  document.getElementById("go").onclick = () => {
    const u = document.getElementById("u").value;
    const p = document.getElementById("p").value;

    if (!u || !p) {
      alert("Completa todo");
      return;
    }

    localStorage.setItem("funbox_user", u);
    alert("Bienvenido " + u);
  };
};

// ======================
// EDITOR 2D
// ======================
let canvas, ctx;
let blocks = [];
let cam = { x: 0, y: 0 };
let mode = "place";

const SIZE = 40;

function startEditor(map = []) {
  blocks = JSON.parse(JSON.stringify(map));

  content.innerHTML = `
    <div class="editor-ui">
      <b>🧱 Funbox Engine</b><br><br>
      <button id="mPlace">🧱 Colocar</button>
      <button id="mDelete">❌ Borrar</button><br><br>
      <button id="save">💾 Guardar</button>
      <button id="exit">🚪 Salir</button>
    </div>

    <canvas id="canvas" width="900" height="500"></canvas>
  `;

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.oncontextmenu = e => e.preventDefault();
  canvas.addEventListener("mousedown", onMouse);
  window.onkeydown = moveCam;

  document.getElementById("mPlace").onclick = () => (mode = "place");
  document.getElementById("mDelete").onclick = () => (mode = "delete");
  document.getElementById("save").onclick = saveGame;
  document.getElementById("exit").onclick = () => location.reload();

  requestAnimationFrame(loop);
}

// ======================
// INPUT EDITOR
// ======================
function gridPos(e) {
  return {
    x: Math.floor((e.offsetX + cam.x) / SIZE),
    y: Math.floor((e.offsetY + cam.y) / SIZE),
  };
}

function onMouse(e) {
  const { x, y } = gridPos(e);

  if (mode === "place" && e.button === 0) {
    let z = 0;
    while (blocks.find(b => b.x === x && b.y === y && b.z === z)) z++;
    blocks.push({ x, y, z });
  }

  if (mode === "delete" && e.button === 0) {
    const stack = blocks.filter(b => b.x === x && b.y === y);
    const top = Math.max(-1, ...stack.map(b => b.z));
    blocks = blocks.filter(
      b => !(b.x === x && b.y === y && b.z === top)
    );
  }
}

// ======================
// CÁMARA EDITOR
// ======================
function moveCam(e) {
  if (e.key === "w") cam.y -= 20;
  if (e.key === "s") cam.y += 20;
  if (e.key === "a") cam.x -= 20;
  if (e.key === "d") cam.x += 20;
}

// ======================
// RENDER EDITOR
// ======================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blocks
    .sort((a, b) => a.z - b.z)
    .forEach(b => {
      ctx.fillStyle = `hsl(${180 - b.z * 10}, 80%, 60%)`;
      ctx.fillRect(
        b.x * SIZE - cam.x,
        b.y * SIZE - cam.y - b.z * 12,
        SIZE - 2,
        SIZE - 2
      );
    });

  requestAnimationFrame(loop);
}

// ======================
// GUARDAR JUEGO
// ======================
function saveGame() {
  const name = prompt("Nombre del juego:");
  if (!name) return;

  const games = getGames();
  games.push({
    name,
    author: getUser(),
    map: blocks,
  });

  localStorage.setItem("funbox_games", JSON.stringify(games));
  alert("Juego guardado 🚀");
}

// ======================
// BOTONES PRINCIPALES
// ======================
createBtn.onclick = () => {
  if (!getUser()) {
    alert("Inicia sesión primero");
    return;
  }
  startEditor();
};

// 👉 ESTO ES LO QUE PEDISTE
playBtn.onclick = () => {
  window.location.href = "play.html";
};
