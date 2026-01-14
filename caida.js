<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Funbox – Test Caída</title>
<style>
  body { margin:0; overflow:hidden; background:black; }
</style>
</head>
<body>

<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
// ======================
// ESCENA BÁSICA
// ======================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,5,10);
camera.lookAt(0,1,0);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

// LUZ
scene.add(new THREE.AmbientLight(0xffffff,0.6));
const sun = new THREE.DirectionalLight(0xffffff,0.8);
sun.position.set(10,20,10);
scene.add(sun);

// SUELO
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50,50),
  new THREE.MeshStandardMaterial({color:0x555555})
);
floor.rotation.x = -Math.PI/2;
scene.add(floor);

// BLOQUES
const block = new THREE.Mesh(
  new THREE.BoxGeometry(2,2,2),
  new THREE.MeshStandardMaterial({color:0x777777})
);
block.position.set(0,1,0);
scene.add(block);

// ======================
// JUGADOR SIMPLE
// ======================
const spawnPoint = new THREE.Vector3(0,3,0);
const player = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.5,1.2),
  new THREE.MeshStandardMaterial({color:0x00ffcc})
);
player.position.copy(spawnPoint);
scene.add(player);

// VARIABLES
let velY = 0;
const gravity = -0.05;

// INPUT
const keys = {};
window.addEventListener("keydown", e=>keys[e.key.toLowerCase()]=true);
window.addEventListener("keyup", e=>keys[e.key.toLowerCase()]=false);

// ======================
// LOOP PRINCIPAL
// ======================
function animate(){
  requestAnimationFrame(animate);

  // MOVIMIENTO
  const dir = new THREE.Vector3();
  let speed = 0.1;
  if(keys.w) dir.z -= 1;
  if(keys.s) dir.z += 1;
  if(keys.a) dir.x -= 1;
  if(keys.d) dir.x += 1;
  if(dir.length()>0){
    dir.normalize();
    player.position.addScaledVector(dir,speed);
  }

  // GRAVEDAD
  velY += gravity;
  player.position.y += velY;

  // COLISIÓN CON SUELO
  const playerBaseY = player.position.y - 0.6; // la base del capsule
  if(playerBaseY <= 0){
    player.position.y = 0.6;
    velY = 0;
  }

  // COLISIÓN CON BLOQUE
  const top = block.position.y + 1;
  if(player.position.x > block.position.x-1 && player.position.x < block.position.x+1 &&
     player.position.z > block.position.z-1 && player.position.z < block.position.z+1 &&
     playerBaseY <= top){
       player.position.y = top + 0.6;
       velY = 0;
  }

  // REAPARECER SI CAE
  if(playerBaseY < -5){
    player.position.copy(spawnPoint);
    velY = 0;
    console.log("¡Jugador reapareció!");
  }

  renderer.render(scene,camera);
}
animate();

window.onresize = ()=>{
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
};
</script>
</body>
</html>
