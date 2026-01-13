const content = document.getElementById("content");

// ======================
// DATOS
// ======================
function getUser() {
  return localStorage.getItem("funbox_user");
}

function getGames() {
  return JSON.parse(localStorage.getItem("funbox_games")) || [];
}

// ======================
// LOGIN
// ======================
document.getElementById("loginBtn").onclick = function () {
  content.innerHTML = `
    <h2>👤 Login</h2>
    <input id="user" placeholder="Usuario"><br><br>
    <input id="pass" type="password" placeholder="Contraseña"><br><br>
    <button id="doLogin">Entrar</button>
  `;

  document.getElementById("doLogin").onclick = function () {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    if (!user || !pass) {
      alert("Completa todo");
      return;
    }

    localStorage.setItem("funbox_user", user);
    alert("Bienvenido " + user + " 🎉");
  };
};

// ======================
// JUGAR
// ======================
document.getElementById("playBtn").onclick = function () {
  const games = getGames();

  if (games.length === 0) {
    content.innerHTML = "<h2>🎮 No hay juegos todavía</h2>";
    return;
  }

  let html = "<h2>🎮 Juegos de la Comunidad</h2>";

  games.forEach(game => {
    html += `
      <div style="border:1px solid #444;padding:10px;margin:10px 0">
        <h3>${game.name}</h3>
        <p>${game.desc}</p>
        <small>Por ${game.author}</small>
      </div>
    `;
  });

  content.innerHTML = html;
};

// ======================
// CREAR → MOTOR 3D
// ======================
let scene, camera, renderer;
let blocks = [];
let running = false;

document.getElementById("createBtn").onclick = function () {
  const user = getUser();
  if (!user) {
    alert("Inicia sesión primero");
    return;
  }

  content.innerHTML = `
    <h2>🧱 Funbox Engine</h2>
    <p>Click para colocar bloques</p>
    <button id="saveMap">Guardar Mapa</button>
    <button id="exitEditor">Salir</button>
  `;

  startEditor();
};

function startEditor() {
  const container = document.getElementById("editor3d");
  container.style.display = "block";
  container.innerHTML = "";

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(6, 6, 10);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  // SUELO
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.name = "ground";
  scene.add(ground);

  window.addEventListener("mousedown", placeBlock);
  running = true;
  animate();
}

function placeBlock(e) {
  if (!running) return;

  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const hits = raycaster.intersectObjects(scene.children);
  if (hits.length === 0) return;

  const p = hits[0].point;

  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x00ffcc })
  );

  cube.position.set(
    Math.round(p.x),
    0.5,
    Math.round(p.z)
  );

  scene.add(cube);
  blocks.push(cube);
}

function animate() {
  if (!running) return;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// ======================
// GUARDAR / SALIR
// ======================
document.addEventListener("click", (e) => {
  if (e.target.id === "saveMap") {
    const maps = JSON.parse(localStorage.getItem("funbox_maps")) || [];

    maps.push({
      author: getUser(),
      blocks: blocks.map(b => ({
        x: b.position.x,
        y: b.position.y,
        z: b.position.z
      }))
    });

    localStorage.setItem("funbox_maps", JSON.stringify(maps));
    alert("Mapa guardado 💾");
  }

  if (e.target.id === "exitEditor") {
    running = false;
    blocks = [];
    document.getElementById("editor3d").style.display = "none";
    content.innerHTML = "<h2>Editor cerrado</h2>";
  }
});
