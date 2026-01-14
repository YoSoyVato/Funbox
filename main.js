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
const getGames = () => JSON.parse(localStorage.getItem("funbox_games")) || [];
const saveGames = g => localStorage.setItem("funbox_games", JSON.stringify(g));

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
    if (!u || !p) return alert("Completa todo");
    localStorage.setItem("funbox_user", u);
    alert("Bienvenido " + u);
  };
};

// ======================
// EDITOR ENGINE
// ======================
let canvas, ctx;
let blocks = [];
let cam = { x: 0, y: 0 };
let mode = "edit"; // edit | play
let tool = "place"; // place | delete
let dragging = false;
let lastMouse = { x: 0, y: 0 };

const SIZE = 40;

// ======================
// INICIAR EDITOR
// ======================
function startEditor(map = []) {
  blocks = JSON.parse(JSON.stringify(map));
  cam = { x: 0, y: 0 };
  mode = "edit";
  tool = "place";

  content.innerHTML = `
    <div class="editor-ui">
      <b>🧱 Funbox Engine</b><br><br>

      <button id="editMode">✏️ Editar</button>
      <button id="playMode">🎮 Jugar</button>
      <hr>

      <button id="place">🧱 Colocar</button>
      <button id="delete">❌ Borrar</button>
      <hr>

      <button id="save">💾 Guardar</button>
      <button id="exit">🚪 Salir</button>
    </div>

    <canvas id="canvas" width="1000" height="550"></canvas>
  `;

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  // Eventos
  canvas.oncontextmenu = e => e.preventDefault();
  canvas.onmousedown = mouseDown;
  canvas.onmouseup = () => dragging = false;
  canvas.onmousemove = mouseMove;

  window.onkeydown = moveCam;

  // Botones
  document.getElementById("editMode").onclick = () => mode = "edit";
  document.getElementById("playMode").onclick = () => mode = "play";

  document.getElementById("place").onclick = () => tool = "place";
  document.getElementById("delete").onclick = () => tool = "delete";

  document.getElementById("save").onclick = saveGame;
  document.getElementById("exit").onclick = () => location.reload();

  requestAnimationFrame(loop);
}

// ======================
// INPUT
// ======================
function gridPos(e) {
  return {
    x: Math.floor((e.offsetX + cam.x) / SIZE),
    y: Math.floor((e.offsetY + cam.y) / SIZE)
  };
}

function mouseDown(e) {
  if (e.button === 1 || e.button === 2) {
    dragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    return;
  }

  if (mode !== "edit") return;

  const { x, y } = gridPos(e);

  if (tool === "place" && e.button === 0) {
    let z = 0;
    while (blocks.find(b => b.x === x && b.y === y && b.z === z)) z++;
    blocks.push({ x, y, z });
  }

  if (tool === "delete" && e.button === 0) {
    const stack = blocks.filter(b => b.x === x && b.y === y);
    const top = Math.max(-1, ...stack.map(b => b.z));
    blocks = blocks.filter(b => !(b.x === x && b.y === y && b.z === top));
  }
}

function mouseMove(e) {
  if (!dragging) return;
  cam.x -= e.clientX - lastMouse.x;
  cam.y -= e.clientY - lastMouse.y;
  lastMouse = { x: e.clientX, y: e.clientY };
}

// ======================
// CÁMARA (WASD)
// ======================
function moveCam(e) {
  if (e.key === "w") cam.y -= 30;
  if (e.key === "s") cam.y += 30;
  if (e.key === "a") cam.x -= 30;
  if (e.key === "d") cam.x += 30;
}

// ======================
// RENDER
// ======================
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blocks
    .sort((a, b) => a.z - b.z)
    .forEach(b => {
      ctx.fillStyle = `hsl(${200 - b.z * 12},70%,55%)`;
      ctx.fillRect(
        b.x * SIZE - cam.x,
        b.y * SIZE - cam.y - b.z * 12,
        SIZE - 2,
        SIZE - 2
      );
    });

  if (mode === "play") {
    ctx.fillStyle = "white";
    ctx.fillText("🎮 MODO JUGAR", 20, 20);
  } else {
    ctx.fillStyle = "white";
    ctx.fillText("✏️ MODO EDITAR", 20, 20);
  }

  requestAnimationFrame(loop);
}

// ======================
// GUARDAR
// ======================
function saveGame() {
  const name = prompt("Nombre del juego:");
  if (!name) return;

  const games = getGames();
  games.push({
    name,
    author: getUser(),
    map: blocks
  });

  saveGames(games);
  alert("Juego guardado 🚀");
}

// ======================
// BOTONES PRINCIPALES
// ======================
createBtn.onclick = () => {
  if (!getUser()) return alert("Inicia sesión primero");
  startEditor();
};

playBtn.onclick = () => {
  const games = getGames();
  if (!games.length) {
    content.innerHTML = "<h2>🎮 No hay juegos todavía</h2>";
    return;
  }

  content.innerHTML = "<h2>🎮 Juegos</h2>";
  games.forEach(g => {
    const b = document.createElement("button");
    b.textContent = `${g.name} - ${g.author}`;
    b.onclick = () => startEditor(g.map);
    content.appendChild(b);
    content.appendChild(document.createElement("br"));
  });
};
