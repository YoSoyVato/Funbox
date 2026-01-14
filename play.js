// --- CONFIGURACIÓN ESCENA ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f2f5); // Color gris suave profesional

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Activar sombras
document.body.appendChild(renderer.domElement);

// --- ILUMINACIÓN ---
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const light = new THREE.DirectionalLight(0xffffff, 0.6);
light.position.set(10, 20, 10);
light.castShadow = true;
scene.add(light);

// --- SUELO ---
const floorSize = 50;
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(floorSize, floorSize),
    new THREE.MeshStandardMaterial({ color: 0xeeeeee })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// --- CARGA DE MAPA (Desde el Editor) ---
const mapData = JSON.parse(localStorage.getItem("funbox_map")) || [];
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const boxMat = new THREE.MeshStandardMaterial({ color: 0x888888 });

mapData.forEach(b => {
    const block = new THREE.Mesh(boxGeo, boxMat);
    block.position.set(b.x, 0.5, b.y); // Usamos b.y como Z
    block.castShadow = true;
    block.receiveShadow = true;
    scene.add(block);
});

// --- PERSONAJE FUNBOX PRO (Integrado) ---
const player = new THREE.Group();
const cuerpoVisual = new THREE.Group();
player.add(cuerpoVisual);

// Materiales
const matPiel = new THREE.MeshStandardMaterial({color: 0xffdbac});
const matPelo = new THREE.MeshStandardMaterial({color: 0x4e342e}); 
const matRopa = new THREE.MeshStandardMaterial({color: 0x2196f3});
const matOjoNegro = new THREE.MeshBasicMaterial({color: 0x111111});

// Cabeza y Cuerpo (Misma estructura que perfeccionamos)
const cabezaGroup = new THREE.Group();
cabezaGroup.position.y = 0.75;
cuerpoVisual.add(cabezaGroup);

const cabezaMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.5), matPiel);
cabezaMesh.castShadow = true;
cabezaGroup.add(cabezaMesh);

// ... (Pelo, Ojos, Brazos, Piernas - Versión simplificada para play.js)
const cuerpoRef = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.2, 4, 12), matRopa);
cuerpoRef.position.y = 0.35; cuerpoVisual.add(cuerpoRef);

const brazoI = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), matPiel);
brazoI.position.set(-0.3, 0.4, 0); cuerpoVisual.add(brazoI);
const brazoD = brazoI.clone();
brazoD.position.set(0.3, 0.4, 0); cuerpoVisual.add(brazoD);

const piernaI = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.1, 4, 8), new THREE.MeshStandardMaterial({color:0x333333}));
piernaI.position.set(-0.12, 0.1, 0); player.add(piernaI);
const piernaD = piernaI.clone();
piernaD.position.set(0.12, 0.1, 0); player.add(piernaD);

scene.add(player);

// --- LÓGICA DE JUEGO ---
let vy = 0, onGround = true, isDead = false, isHeadMode = false;
const gravity = -0.012, jumpForce = 0.25;
const keys = {};
let yaw = 0, step = 0;

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    if(e.code === "Space" && onGround) vy = jumpForce;
    if(e.key.toLowerCase() === "c") isHeadMode = !isHeadMode;
});
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
document.addEventListener("mousemove", e => { if(document.pointerLockElement) yaw -= e.movementX * 0.003; });
renderer.domElement.onclick = () => renderer.domElement.requestPointerLock();

function animate() {
    requestAnimationFrame(animate);

    // Físicas básicas
    player.position.y += vy;
    if (player.position.y > 0) { vy += gravity; onGround = false; } 
    else { player.position.y = 0; vy = 0; onGround = true; }

    // Movimiento
    let moving = false, dir = new THREE.Vector3();
    if(keys.w) { dir.z -= 1; moving = true; }
    if(keys.s) { dir.z += 1; moving = true; }
    if(keys.a) { dir.x -= 1; moving = true; }
    if(keys.d) { dir.x += 1; moving = true; }

    let speed = keys.shift ? 0.18 : 0.09;
    if(isHeadMode) speed = 0.12;

    player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, yaw + Math.PI, 0.1);

    if(moving) {
        const moveDir = dir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
        player.position.addScaledVector(moveDir, speed);
        
        if(!isHeadMode) {
            step += (keys.shift ? 0.4 : 0.25);
            piernaI.rotation.x = Math.sin(step) * 0.8;
            piernaD.rotation.x = Math.sin(step + Math.PI) * 0.8;
            brazoI.position.z = Math.sin(step + Math.PI) * 0.15;
            brazoD.position.z = Math.sin(step) * 0.15;
        } else {
            cabezaMesh.rotation.x -= 0.15;
        }
    } else {
        // Pose Neutra
        brazoI.position.z = THREE.MathUtils.lerp(brazoI.position.z, 0, 0.1);
        brazoD.position.z = THREE.MathUtils.lerp(brazoD.position.z, 0, 0.1);
        piernaI.rotation.x = THREE.MathUtils.lerp(piernaI.rotation.x, 0, 0.1);
        piernaD.rotation.x = THREE.MathUtils.lerp(piernaD.rotation.x, 0, 0.1);
    }

    // Transformación Cabeza (Visual)
    const t = 0.15;
    if(isHeadMode) {
        cuerpoRef.scale.set(0, 0, 0);
        brazoI.scale.set(0,0,0); brazoD.scale.set(0,0,0);
        cabezaGroup.position.y = THREE.MathUtils.lerp(cabezaGroup.position.y, 0.25, t);
    } else {
        cuerpoRef.scale.set(1, 1, 1);
        brazoI.scale.set(1,1,1); brazoD.scale.set(1,1,1);
        cabezaGroup.position.y = THREE.MathUtils.lerp(cabezaGroup.position.y, 0.75, t);
    }

    // Cámara Follow
    let camDist = keys.r ? -2.5 : (isHeadMode ? 2.5 : 4);
    const camOffset = new THREE.Vector3(0, 2, camDist).applyAxisAngle(new THREE.Vector3(0,1,0), yaw);
    camera.position.lerp(player.position.clone().add(camOffset), 0.1);
    camera.lookAt(player.position.clone().add(new THREE.Vector3(0, 1, 0)));

    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
