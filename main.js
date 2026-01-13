const content = document.getElementById("content");

// =====================
// DATOS
// =====================
function getUser() {
  return localStorage.getItem("funbox_user");
}

function getGames() {
  return JSON.parse(localStorage.getItem("funbox_games")) || [];
}

// =====================
// LOGIN
// =====================
document.getElementById("loginBtn").onclick = () => {
  content.innerHTML = `
    <h2>👤 Login</h2>
    <input id="user" placeholder="Usuario"><br><br>
    <input id="pass" type="password" placeholder="Contraseña"><br><br>
    <button id="doLogin">Entrar</button>
  `;

  document.getElementById("doLogin").onclick = () => {
    const user = user.value;
    const pass = pass.value;

    if (!user || !pass) {
      alert("Completa todo");
      return;
    }

    localStorage.setItem("funbox_user", user);
    alert("Bienvenido " + user);
  };
};

// =====================
// MOTOR DE CREACIÓN
// =====================
let canvas, ctx;
let blocks = [];
let camX = 0, camY = 0;
let editMode = "place";

function startEditor() {
  content.innerHTML = `
    <div class="editor-ui">
      <h3>🧱 Funbox Engine</h3>
      <button id="modePlace">Colocar</button>
      <button id="modeDelete">Borrar</button><br><br>
      <button id="saveGame">Guardar Juego</button>
      <button id="exitEditor">Salir</button>
    </div>
    <canvas id="gameCanvas" width="900" height="500"></canvas>
  `;

  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  canvas.onclick = placeBlock;
  window.onkeydown = moveCamera;

  document.getElementById("modePlace").onclick = () => editMode = "place";
  document.getElementById("modeDelete").onclick = () => editMode = "delete";

  document.getElementById("saveGame").onclick = saveGame;
  document.getElementById("exitEditor").onclick = () => location.reload();

  render();
}

// =====================
// BLOQUES
// =====================
function placeBlock(e) {
  const x = Math.floor((e.offsetX + camX) / 40);
  const y = Math.floor((e.offsetY + camY) / 40);

  if (editMode === "delete") {
    blocks = blocks.filter(b => !(b.x === x && b.y === y));
    return;
  }

  blocks.push({ x, y });
}

function moveCamera(e) {
  if (e.key === "w") camY -= 20;
  if (e.key === "s") camY += 20;
  if (e.key === "a") camX -= 20;
  if (e.key === "d") camX += 20;
}

// =====================
// RENDER
// =====================
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blocks.forEach(b => {
    ctx.fillStyle = "#00ffcc";
    ctx.fillRect(b.x * 40 - camX, b.y * 40 - camY, 38, 38);
  });

  requestAnimationFrame(render);
}

// =====================
// GUARDAR JUEGO
// =====================
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

// =====================
// CREAR
// =====================
document.getElementById("createBtn").onclick = () => {
  if (!getUser()) {
    alert("Inicia sesión primero");
    return;
  }
  startEditor();
};

// =====================
// JUGAR
// =====================
document.getElementById("playBtn").onclick = () => {
  const games = getGames();

  if (games.length === 0) {
    content.innerHTML = "<h2>No hay juegos aún</h2>";
    return;
  }

  let html = "<h2>🎮 Juegos de la Comunidad</h2>";
  games.forEach((g, i) => {
    html += `<button onclick="loadGame(${i})">${g.name} - ${g.author}</button><br><br>`;
  });

  content.innerHTML = html;
};

window.loadGame = function (i) {
  const game = getGames()[i];
  blocks = game.map;
  startEditor();
};
