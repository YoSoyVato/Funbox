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
    if (!u.value || !p.value) return alert("Completa todo");
    localStorage.setItem("funbox_user", u.value);
    alert("Bienvenido " + u.value);
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
  cam = { x: 0, y: 0 };

  content.innerHTML = `
    <div class="editor-ui">
      <h3>🧱 Funbox Engine</h3>

      <button id="mPlace">🧱 Colocar</button>
      <button id="mDelete">❌ Borrar</button>
      <hr>

      <button id="playMode" style="
        background:#2ecc71;
        color:black;
        font-weight:bold;
        width:100%;
        padding:10px;
        margin-bottom:6px;
      ">🎮 JUGAR (3D)</button>

      <button id="save">💾 Guardar</button>
      <button id="exit">🚪 Salir</button>
    </div>

    <canvas id="canvas" width="900" height="500"></canvas>
  `;

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.oncontextmenu = e => e.preventDefault();
  canvas.onmousedown = onMouse;
  window.onkeydown = moveCam;

  mPlace.onclick = () => mode = "place";
  mDelete.onclick = () => mode = "delete";
  save.onclick = saveGame;
  exit.onclick = () => location.reload();
  playMode.onclick = () => startPlay3D(blocks);

  requestAnimationFrame(render2D);
}

// ======================
// INPUT EDITOR
// ======================
function gridPos(e) {
  return {
    x: Math.floor((e.offsetX + cam.x) / SIZE),
    y: Math.floor((e.offsetY + cam.y) / SIZE)
  };
}

function onMouse(e) {
  const { x, y } = gridPos(e);

  if (mode === "place") {
    let z = 0;
    while (blocks.find(b => b.x === x && b.y === y && b.z === z)) z++;
    blocks.push({ x, y, z });
  }

  if (mode === "delete") {
    const stack = blocks.filter(b => b.x === x && b.y === y);
    const top = Math.max(-1, ...stack.map(b => b.z));
    blocks = blocks.filter(b => !(b.x === x && b.y === y && b.z === top));
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
function render2D() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blocks.sort((a, b) => a.z - b.z).forEach(b => {
    ctx.fillStyle = `hsl(${180 - b.z * 12},80%,60%)`;
    ctx.fillRect(
      b.x * SIZE - cam.x,
      b.y * SIZE - cam.y - b.z * 12,
      SIZE - 2,
      SIZE - 2
    );
  });

  requestAnimationFrame(render2D);
}

// ======================
// GUARDAR
// ======================
function saveGame() {
  const name = prompt("Nombre del juego:");
  if (!name) return;

  const games = getGames();
  games.push({ name, author: getUser(), map: blocks });
  localStorage.setItem("funbox_games", JSON.stringify(games));
  alert("Juego guardado 🚀");
}

// ======================
// MODO JUGAR 3D
// ======================
function startPlay3D(map) {
  content.innerHTML = `
    <button id="back" style="
      position:fixed;
      top:100px;
      left:10px;
      z-index:20;
    ">⬅ Volver al editor</button>
  `;

  back.onclick = () => startEditor(map);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  content.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.set(10, 20, 10);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x3a7d44 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  map.forEach(b => {
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    cube.position.set(b.x, b.z + 0.5, b.y);
    scene.add(cube);
  });

  const player = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.4, 1.3, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0x2196f3 })
  );
  player.position.set(0, 2, 0);
  scene.add(player);

  camera.position.set(0, 4, 6);

  const keys = {};
  onkeydown = e => keys[e.key] = true;
  onkeyup = e => keys[e.key] = false;

  function animate() {
    requestAnimationFrame(animate);

    if (keys.w) player.position.z -= 0.1;
    if (keys.s) player.position.z += 0.1;
    if (keys.a) player.position.x -= 0.1;
    if (keys.d) player.position.x += 0.1;

    camera.position.x = player.position.x;
    camera.position.z = player.position.z + 6;
    camera.lookAt(player.position);

    renderer.render(scene, camera);
  }

  animate();
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
  if (!games.length) return content.innerHTML = "<h2>No hay juegos</h2>";

  content.innerHTML = "<h2>🎮 Juegos</h2>";
  games.forEach(g => {
    const b = document.createElement("button");
    b.textContent = `${g.name} - ${g.author}`;
    b.onclick = () => startPlay3D(g.map);
    content.appendChild(b);
    content.appendChild(document.createElement("br"));
  });
};

