const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // Cielo azul claro

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
// Ajustamos el plano lejano (2000) para poder ver a lo lejos en un mundo de 500x500

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// --- ILUMINACIÓN ---
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, 100, 50); // Subimos la luz por el tamaño del mapa
light.castShadow = true;
// Ajustar el área de sombra para mapas grandes
light.shadow.camera.left = -250;
light.shadow.camera.right = 250;
light.shadow.camera.top = 250;
light.shadow.camera.bottom = -250;
scene.add(light);

// --- SUELO GIGANTE (500x500) ---
const floorGeo = new THREE.PlaneGeometry(500, 500);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x3a7d44 }); // Verde pasto
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// --- CARGA DE MAPA DESDE EDITOR ---
const mapData = JSON.parse(localStorage.getItem("funbox_map")) || [];
const geo = new THREE.BoxGeometry(1, 1, 1);
const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });

mapData.forEach(b => {
  const block = new THREE.Mesh(geo, mat);
  // b.x y b.y son las celdas guardadas por el editor
  block.position.set(b.x, 0.5, b.y); 
  block.castShadow = true;
  block.receiveShadow = true;
  scene.add(block);
});

// --- PERSONAJE FUNBOX PRO ---
const player = new THREE.Group();
const visual = new THREE.Group();
player.add(visual);

const matPiel = new THREE.MeshStandardMaterial({ color: 0xffdbac });
const matPelo = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
const matRopa = new THREE.MeshStandardMaterial({ color: 0x0077be });

// Cabeza
const cabezaGroup = new THREE.Group();
cabezaGroup.position.y = 0.8;
visual.add(cabezaGroup);
const cabezaMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), matPiel);
cabezaMesh.castShadow = true;
cabezaGroup.add(cabezaMesh);

// Ojos con brillo (como tu captura)
function crearOjo(x) {
    const ojo = new THREE.Mesh(new THREE.CircleGeometry(0.08, 16), new THREE.MeshBasicMaterial({color:0x111111}));
    const brillo = new THREE.Mesh(new THREE.CircleGeometry(0.025, 8), new THREE.MeshBasicMaterial({color:0xffffff}));
    brillo.position.set(0.03, 0.03, 0.01);
    ojo.add(brillo);
    ojo.position.set(x, 0, 0.301);
    return ojo;
}
cabezaMesh.add(crearOjo(-0.18), crearOjo(0.18));

// Pelo y Barba
const pelo = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.25, 0.62), matPelo);
pelo.position.y = 0.21; cabezaMesh.add(pelo);
const barba = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.2, 0.62), matPelo);
barba.position.y = -0.22; cabezaMesh.add(barba);

// Cuerpo y Manos
const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.4, 4, 8), matRopa);
cuerpo.position.y = 0.3; visual.add(cuerpo);
const manoI = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), matPiel);
manoI.position.set(-0.35, 0.35, 0); visual.add(manoI);
const manoD = manoI.clone();
manoD.position.set(0.35, 0.35, 0); visual.add(manoD);

scene.add(player);

// --- CONTROLES Y CÁMARA ---
let vy = 0, onGround = true, yaw = 0, step = 0, isHeadMode = false;
const keys = {};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if(e.code === "Space" && onGround) vy = 0.25;
  if(e.key === "c") isHeadMode = !isHeadMode;
});
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
document.addEventListener("mousemove", e => { if(document.pointerLockElement) yaw -= e.movementX * 0.003; });
renderer.domElement.onclick = () => renderer.domElement.requestPointerLock();

function animate() {
  requestAnimationFrame(animate);

  // Física simple
  player.position.y += vy;
  if(player.position.y > 0) { vy -= 0.012; onGround = false; }
  else { player.position.y = 0; vy = 0; onGround = true; }

  // Movimiento
  let moving = false, dir = new THREE.Vector3();
  if(keys.w) { dir.z -= 1; moving = true; }
  if(keys.s) { dir.z += 1; moving = true; }
  if(keys.a) { dir.x -= 1; moving = true; }
  if(keys.d) { dir.x += 1; moving = true; }

  const speed = keys.shift ? 0.2 : 0.1;
  player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, yaw + Math.PI, 0.1);

  if(moving) {
    const mDir = dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
    player.position.addScaledVector(mDir, speed);
    
    if(!isHeadMode) {
        step += 0.25;
        manoI.position.z = Math.sin(step) * 0.2;
        manoD.position.z = Math.sin(step + Math.PI) * 0.2;
    } else {
        cabezaMesh.rotation.x -= 0.15;
    }
  }

  // Cámara Follow
  const camOffset = new THREE.Vector3(0, 2, 5).applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
  camera.position.lerp(player.position.clone().add(camOffset), 0.1);
  camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 1, 0)));

  renderer.render(scene, camera);
}
animate();
