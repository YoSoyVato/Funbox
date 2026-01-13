import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

// CONTENEDOR
const container = document.getElementById("game");

// ESCENA
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0e0e);

// CÁMARA
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.5, 4);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// CUBO (OBJETO DE PRUEBA)
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// LUZ
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// ANIMACIÓN
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.01;
  cube.rotation.x += 0.005;
  renderer.render(scene, camera);
}
animate();

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// BOTONES (por ahora solo info)
document.getElementById("playBtn").onclick = () => {
  alert("Modo Jugar (próximamente)");
};

document.getElementById("createBtn").onclick = () => {
  alert("Modo Crear (editor en desarrollo)");
};

document.getElementById("loginBtn").onclick = () => {
  alert("Sistema de cuentas próximamente");
};
