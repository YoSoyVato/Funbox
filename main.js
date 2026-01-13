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
    <input id="p" type="password" placeholder="Contraseña"><br><br>
    <button id="go">Entrar</button>
  `;

  go.onclick = () => {
    if (!u.value || !p.value) return alert("Completa todo");
    localStorage.setItem("funbox_user", u.value);
    alert("Bienvenido " + u.value);
  };
};

// ======================
// EDITOR
// ======================
let canvas, ctx;
let blocks = [];
let cam = { x: 0, y: 0 };
let dragging = false;
let lastMouse = { x: 0, y: 0 };

const SIZE = 40;

function startEditor(map = []) {
  blocks = JSON.parse(JSON.stringify(map));

  content.innerHTML = `
    <div class="editor-ui">
      <b>🧱 Funbox Engine</b><br>
      Click = poner<br>
      Click derecho = borrar<br>
      WASD = mover cámara<br>
      Arrastrar mouse = mover cámara<br><br>
      <button id="save">Guardar</button>
      <button id="exit">Salir</button>
    </div>
    <canvas id="canvas" width="900" height="500"></canvas>
  `;

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.addEventListener("mousedown", mouseDown);
  canvas.addEventListener("mouseup", () => dragging = false);
  canvas.addEventListener("mousemove", mouseMove);
  canvas.addEventListener("contextmenu", e => e.preventDefault());
  canvas.addEventListener("click", placeBlock);
  canvas.addEventListener("auxclick", deleteBlock);

  window.addEventListener("keydown", moveCam);

  save.onclick = saveGame;
  exit.onclick = () => location.reload();

  requestAnimationFrame(loop);
}

// ======================
// BLOQUES
// ======================
function gridPos(e) {
  return {
    x: Math.floor((e.offsetX + cam.x) / SIZE),
    y: Math.floor((e.offsetY + cam.y) / SIZE)
  };
}

function placeBlock(e) {
  if (e.button !== 0) return;

  const { x, y } = gridPos(e);

  let z = 0;
  while (blocks.find(b => b.x === x && b.y === y && b.z === z)) {
    z++;
  }

  blocks.push({ x, y, z });
}

function deleteBlock(e) {
  const { x, y } = gridPos(e);

  const maxZ = Math.max(
    -1,
    ...blocks.filter(b => b.x === x && b.y === y).map(b => b.z)
  );

  blocks = blocks.filter(b => !(b.x === x && b.y === y && b.z === maxZ));
}

// ======================
// CÁMARA
// ======================
function moveCam(e) {
  if (e.key === "w") cam.y -= 20;
  if (e.key === "s") cam.y += 20;
  if (e.key === "a") cam.x -= 20;
  if (e.key === "d") cam.x += 20;
}

function mouseDown(e) {
  if (e.button !== 1) return;
  dragging = true;
  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;
}

function mouseMove(e) {
  if (!dragging) return;
  cam.x -= e.clientX - lastMouse.x;
  cam.y -= e.clientY - lastMouse.y;
  lastMouse.x = e.clientX;
  lastMouse.y = e.clientY;
}

// ======================
// RENDER
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
// GUARDAR / JUGAR
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

  localStorage.setItem("funbox_games", JSON.stringify(games));
  alert("Juego publicado 🚀");
}

// ======================
// BOTONES
// ======================
createBtn.onclick = () => {
  if (!getUser()) return alert("Inicia sesión primero");
  startEditor();
};

playBtn.onclick = () => {
  const games = getGames();
  if (!games.length) return content.innerHTML = "<h2>No hay juegos</h2>";

  content.innerHTML = "<h2>🎮 Juegos</h2>";
  games.forEach((g, i) => {
    const b = document.createElement("button");
    b.textContent = `${g.name} - ${g.author}`;
    b.onclick = () => startEditor(g.map);
    content.appendChild(b);
    content.appendChild(document.createElement("br"));
  });
};


