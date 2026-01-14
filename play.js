const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 6, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

// Suelo
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x3a7d44 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Mapa
const map = JSON.parse(localStorage.getItem("funbox_map")) || [];
const geo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });

map.forEach(b => {
  const block = new THREE.Mesh(geo, mat);
  block.position.set(b.x, 0.5, b.y);
  scene.add(block);
});

// Player
const player = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.4, 1.2),
  new THREE.MeshStandardMaterial({ color: 0x2244ff })
);
player.position.y = 1;
scene.add(player);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
