import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

// =====================
// ESTADO DE LA APP
// =====================
let currentMode = "play";

// =====================
// CONTENEDOR
// =====================
const container = document.getElementById("game");

// =====================
// ESCENA
// =====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0e0e);

// =====================
// CÁMARA
// =====================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 2, 6);

// =====================
// RENDERER
// =====================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// =====================
// LUCES
// =====================
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// =====================
// OBJETOS BASE
// =====================
let cube;

function createPlayWorld() {
  clearScene();

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}

function createEditorWorld() {
  clearScene();

  const grid = new THREE.GridHelper(10, 10);
  scene.add(grid);
}

// =====================
// LIMPIAR ESCENA
// =====================
function clearScene() {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  // volver a poner luces
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
}

// =====================
// MODOS
// =====================
function setMode(mode) {
  currentMode = mode;

  if (mode === "play") {
    createPlayWorld();
  }

  if (mode === "create") {
    createEditorWorld();
  }

  if (mode === "login") {
    showLogin();
  }
}

// =====================
// LOGIN FAKE (UI)
// =====================
function showLogin() {
  const loginBox = document.createElement("div");
  loginBox.id = "loginBox";
  loginBox.innerHTML = `
    <h2>Login</h2>
    <input placeholder="Usuario"><br><br>
    <button id="loginConfirm">Entrar</button>
  `;

  Object.assign(loginBox.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#151515",
    padding: "20px",
    borderRadius: "10px",
    zIndex: 20,
  });

  document.body.appendChild(loginBox);

  document.getElementById("loginConfirm").onclick = () => {
    alert("Login exitoso (fake 😎)");
    loginBox.remove();
    setMode("play");
  };
}

// =====================
// BOTONES
// =====================
document.getElementById("playBtn").onclick = () => {
  setMode("play");
};

document.getElementById("createBtn").onclick = () => {
  setMode("create");
};

document.getElementById("loginBtn").onclick = () => {
  setMode("login");
};

// =====================
// LOOP
// =====================
function animate() {
  requestAnimationFrame(animate);

  if (currentMode === "play" && cube) {
    cube.rotation.y += 0.01;
    cube.rotation.x += 0.005;
  }

  renderer.render(scene, camera);
}
animate();

// =====================
// RESIZE
// =====================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// =====================
// INICIO
// =====================
setMode("play");
