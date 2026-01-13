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
let blocks = []; // {x,y,z}
let cam = { x: 0, y: 0 };
const size = 40;

function startEditor(loadMap = []) {
  blocks = loadMap;

  content.innerHTML = `
    <div class="editor-ui">
      <b>🧱 Editor Funbox</b><br>
      Click = poner<br>
      Click derecho = borrar<br>
      WASD = mover cámara<br><br>
      <button id="save">Guardar</button>
      <button id="exit">Salir</button>
    </div>
    <canvas id="c" width="900" height="500"></canvas>
  `;

  canvas = c;
  ctx = canvas.getContext("2d");

  canvas.oncontextmenu = e => e.preventDefault();
  canvas.onmousedown = handleClick;
  window.onkeydown = moveCam;

  save.onclick = saveGame;
  exit.onclick = () => location.reload();

  loop();
}

// ======================
// COLOCAR / BORRAR / APILAR
// ======================
function handleClick(e) {
  const gx = Math.floor((e.offsetX + cam.x) / size);
  const gy = Math.floor((e.offsetY + cam.y) / size);

  if (e.button === 2) {
    blocks = blocks.filter(b => !(b.x === gx && b.y === gy));
    return;
  }

  // BUSCAR ALTURA PARA APILAR
  let z = 0;
  while (blocks.find(b => b.x === gx && b.y === gy && b.z === z)) {
    z++;
  }

  blocks.push({ x: gx, y: gy, z });
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

// ======================
// RENDER
// ======================
function loop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  blocks
    .sort((a,b)=>a.z-b.z)
    .forEach(b=>{
      ctx.fillStyle = `rgb(${50+b.z*30},200,200)`;
      ctx.fillRect(
        b.x*size - cam.x,
        b.y*size - cam.y - b.z*10,
        size-2,
        size-2
      );
    });

  requestAnimationFrame(loop);
}

// ======================
// GUARDAR / PUBLICAR
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
  if (!getUser()) return alert("Inicia sesión");
  startEditor();
};

playBtn.onclick = () => {
  const games = getGames();
  if (!games.length) return content.innerHTML = "<h2>No hay juegos</h2>";

  let html = "<h2>🎮 Juegos</h2>";
  games.forEach((g,i)=>{
    html += `<button onclick="load(${i})">${g.name} - ${g.author}</button><br><br>`;
  });
  content.innerHTML = html;
};

window.load = i => {
  startEditor(getGames()[i].map);
};

