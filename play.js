<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Launcher 3D - Funbox</title>
<style>
  body { margin:0; overflow:hidden; background:black; }
  #ui {
    position: fixed; top:10px; left:10px; color:white;
    font-family: Arial; background: rgba(0,0,0,0.6);
    padding:10px; border-radius:8px; z-index:10;
  }
</style>
</head>
<body>

<div id="ui">
  🎮 **Launcher 3D Funbox**<br>
  WASD: Moverse | Shift: Correr | Space: Saltar | C: Modo Cabeza<br>
  <small>Los bloques que colocaste en el Motor aparecerán aquí</small>
</div>

<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script>
// ---------------- ESCENA ----------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0b0c0);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Luz
scene.add(new THREE.AmbientLight(0xffffff,0.7));
const sun = new THREE.DirectionalLight(0xffffff,0.8);
sun.position.set(10,20,10);
sun.castShadow = true;
scene.add(sun);

// Suelo
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100,100),
    new THREE.MeshStandardMaterial({ color:0x444444 })
);
floor.rotation.x = -Math.PI/2;
floor.receiveShadow = true;
scene.add(floor);

// ---------------- BLOQUES ----------------
const blocks = [];
const mapData = JSON.parse(localStorage.getItem("funbox_map")) || [];
const boxGeo = new THREE.BoxGeometry(1,1,1);
const boxMat = new THREE.MeshStandardMaterial({color:0x777777});

mapData.forEach(b => {
    const block = new THREE.Mesh(boxGeo, boxMat);
    block.position.set(b.x, 0.5, b.y);
    block.castShadow = true;
    block.receiveShadow = true;
    scene.add(block);
    blocks.push(block);
});

// ---------------- PERSONAJE ----------------
const player = new THREE.Group();
const visual = new THREE.Group();
player.add(visual);

const matPiel = new THREE.MeshStandardMaterial({color:0xffdbac});
const matPelo = new THREE.MeshStandardMaterial({color:0x3d2b1f});
const matRopa = new THREE.MeshStandardMaterial({color:0x0077be});

// Cabeza
const cabezaGroup = new THREE.Group();
cabezaGroup.position.y = 0.8;
visual.add(cabezaGroup);

const cabezaMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6), matPiel);
cabezaMesh.castShadow = true;
cabezaGroup.add(cabezaMesh);

// Pelo y barba
const pelo = new THREE.Mesh(new THREE.BoxGeometry(0.62,0.25,0.62), matPelo);
pelo.position.y = 0.2; cabezaMesh.add(pelo);
const barba = new THREE.Mesh(new THREE.BoxGeometry(0.62,0.2,0.62), matPelo);
barba.position.y = -0.22; cabezaMesh.add(barba);

// Ojos
function crearOjo(x){
    const ojo = new THREE.Mesh(new THREE.CircleGeometry(0.08,16), new THREE.MeshBasicMaterial({color:0x111111}));
    const brillo = new THREE.Mesh(new THREE.CircleGeometry(0.025,8), new THREE.MeshBasicMaterial({color:0xffffff}));
    brillo.position.set(0.03,0.03,0.01);
    ojo.add(brillo);
    ojo.position.set(x,0,0.301);
    return ojo;
}
cabezaMesh.add(crearOjo(-0.18), crearOjo(0.18));

// Cuerpo capsule
const cuerpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.2,0.4,4,8), matRopa);
cuerpo.position.y = 0.3; visual.add(cuerpo);

// Manos
const manoGeo = new THREE.SphereGeometry(0.08,8,8);
const manoI = new THREE.Mesh(manoGeo, matPiel); manoI.position.set(-0.35,0.35,0); visual.add(manoI);
const manoD = manoI.clone(); manoD.position.set(0.35,0.35,0); visual.add(manoD);

player.position.set(0,5,0);
scene.add(player);

// ---------------- VARIABLES ----------------
let vy = 0, onGround = false, isHeadMode = false, blinkTimer = 0;
const keys = {};
let yaw = 0, step = 0;

// ---------------- INPUT ----------------
window.addEventListener("keydown", e=>{
    keys[e.key.toLowerCase()] = true;
    if(e.code==="Space" && onGround) vy=0.25;
    if(e.key==="c") isHeadMode=!isHeadMode;
});
window.addEventListener("keyup", e=>keys[e.key.toLowerCase()]=false);

document.addEventListener("mousemove", e=>{
    if(document.pointerLockElement) yaw -= e.movementX*0.003;
});
renderer.domElement.onclick = ()=>renderer.domElement.requestPointerLock();

// ---------------- LOOP ----------------
function animate(){
    requestAnimationFrame(animate);

    // --- GRAVEDAD Y COLISION ---
    player.position.y += vy;
    vy -= 0.012;

    const rayOrigin = new THREE.Vector3(player.position.x, player.position.y + 0.5, player.position.z);
    raycaster.set(rayOrigin, new THREE.Vector3(0,-1,0));
    const intersects = raycaster.intersectObjects([floor,...blocks]);
    if(intersects.length>0 && intersects[0].distance<0.55){
        player.position.y = intersects[0].point.y;
        vy = 0; onGround = true;
    } else onGround=false;

    // --- MOVIMIENTO ---
    let moving = false;
    const moveDir = new THREE.Vector3();
    if(keys.w){moveDir.z-=1; moving=true;}
    if(keys.s){moveDir.z+=1; moving=true;}
    if(keys.a){moveDir.x-=1; moving=true;}
    if(keys.d){moveDir.x+=1; moving=true;}

    const speed = keys.shift ? 0.18 : 0.09;
    if(moving){
        const finalDir = moveDir.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
        player.position.addScaledVector(finalDir, speed);
        step += keys.shift?0.4:0.25;

        manoI.position.z = Math.sin(step)*0.2;
        manoD.position.z = Math.sin(step+Math.PI)*0.2;
    }

    // --- MODO CABEZA ---
    const t=0.15;
    if(isHeadMode){
        cuerpo.scale.set(0,0,0);
        manoI.scale.set(0,0,0); manoD.scale.set(0,0,0);
        cabezaGroup.position.y = THREE.MathUtils.lerp(cabezaGroup.position.y,0.3,t);
    } else {
        cuerpo.scale.set(1,1,1);
        manoI.scale.set(1,1,1); manoD.scale.set(1,1,1);
        cabezaGroup.position.y = THREE.MathUtils.lerp(cabezaGroup.position.y,0.8,t);
    }

    // --- ANIMACION OJOS (IDLE) ---
    if(!moving){
        blinkTimer++;
        const blink = blinkTimer%200 < 5 ? 0.1 : 1;
        cabezaMesh.children.forEach(c=>{
            if(c.geometry instanceof THREE.CircleGeometry) c.scale.y = blink;
        });
    } else blinkTimer=0;

    // --- CAMARA ---
    const camOffset = new THREE.Vector3(0,2,keys.r?-3:4).applyAxisAngle(new THREE.Vector3(0,1,0),yaw);
    camera.position.lerp(player.position.clone().add(camOffset),0.1);
    camera.lookAt(player.position.clone().add(new THREE.Vector3(0,1,0)));

    renderer.render(scene,camera);
}

// Raycaster
const raycaster = new THREE.Raycaster();
animate();

// --- RESIZE ---
window.addEventListener("resize",()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
</script>
</body>
</html>

