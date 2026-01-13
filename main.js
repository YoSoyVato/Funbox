// ======================
// REFERENCIAS
// ======================
const content = document.getElementById("content");
const editorDiv = document.getElementById("editor3d");

let scene, camera, renderer, raycaster, mouse;
let ground;
let blocks = [];
let editorActive = false;

// ======================
// INICIAR EDITOR 3D
// ======================
function startEditor() {
  editorActive = true;

  content.innerHTML = `
    <h2>🧱 Funbox Engine</h2>
    <p>Click en el suelo para colocar bloques</p>
    <button id="saveMap">Guardar Mapa</button>
    <button id="exitEditor">Salir</button>
  `;

  editorDiv.style.display = "block";

  initThree();
  animate();

  document.getElementById("exitEditor").onclick = stopEditor;
  document.getElementById("saveMap").onclick = saveMap;
}

// ======================
// THREE.JS SETUP
// ======================
function initThree() {
  editorDiv.innerHTML = "";

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0e0e);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(5, 6, 8);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  editorDiv.appendChild(renderer.domElement);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // LUCES
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  // SUELO
  const planeGeo = new THREE.PlaneGeometry(50, 50);
  const planeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  ground = new THREE.Mesh(planeGeo, planeMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // GRID
  scene.add(new THREE.GridHelper(50, 50));

  // CLICK
  window.addEventListener("click", onClickPlace);
}

// ======================
// CLICK → COLOCAR BLOQUE
// ======================
function onClickPlace(event) {
  if (!editorActive) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObject(ground);

  if (hits.length > 0) {
    const pos = hits[0].point;

    const block = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x00ffcc })
    );

    block.position.set(
      Math.round(pos.x),
      0.5,
      Math.round(pos.z)
    );

    scene.add(block);
    blocks.push(block);
  }
}

// ======================
// GUARDAR MAPA
// ======================
function saveMap() {
  const data = blocks.map(b => ({
    x: b.position.x,
    y: b.position.y,
    z: b.position.z
  }));

  localStorage.setItem("funbox_map", JSON.stringify(data));
  alert("Mapa guardado 💾");
}

// ======================
// SALIR
// ======================
function stopEditor() {
  editorActive = false;
  editorDiv.style.display = "none";
  content.innerHTML = "<h2>Editor cerrado</h2>";
}

// ======================
// LOOP
// ======================
function animate() {
  if (!editorActive) return;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// ======================
// BOTONES PRINCIPALES
// ======================
document.getElementById("createBtn").onclick = startEditor;

document.getElementById("playBtn").onclick = () => {
  content.innerHTML = "<h2>🎮 Modo Jugar (próximamente)</h2>";
};

document.getElementById("loginBtn").onclick = () => {
  content.innerHTML = "<h2>👤 Login (fake)</h2>";
};
