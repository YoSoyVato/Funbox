const content = document.getElementById("content");

// Intentar cargar mapa previo
let blocks = JSON.parse(localStorage.getItem("funbox_map")) || [];
let canvas, ctx;

const gridDisplaySize = 40; 
const camSpeed = 8; // Velocidad de movimiento en el editor

// Variables de cámara para navegar el mundo 500x500
let camX = 0;
let camY = 0;
const keys = {};

content.innerHTML = `
  <div style="background: #222; padding: 10px; border-radius: 10px; display: inline-block; text-align: center; color: white; font-family: sans-serif;">
    <h3 style="margin: 5px;">🏗️ Funbox Studio: Mundo 500x500</h3>
    <p style="font-size: 11px; color: #888; margin-bottom: 10px;">WASD: Mover cámara | Click Izq: Poner | Click Der: Borrar</p>
    <canvas id="canvas" width="800" height="600" style="cursor: crosshair; background: #333; border: 2px solid #555;"></canvas>
    <div style="margin-top: 10px;">
      <button id="play" style="background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">🎮 Jugar Mapa</button>
      <button id="clear" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">🗑️ Limpiar Todo</button>
    </div>
  </div>
`;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

// Captura de teclado para WASD
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.oncontextmenu = (e) => e.preventDefault();

canvas.onmousedown = e => {
  // Ahora calculamos la posición tomando en cuenta el desplazamiento de la cámara (camX, camY)
  const x = Math.floor((e.offsetX + camX - canvas.width / 2) / gridDisplaySize);
  const y = Math.floor((e.offsetY + camY - canvas.height / 2) / gridDisplaySize);

  if (e.button === 0) { // Click Izquierdo: Agregar
    if (!blocks.find(b => b.x === x && b.y === y)) {
      blocks.push({ x, y, z: 0 });
    }
  } else if (e.button === 2) { // Click Derecho: Borrar
    blocks = blocks.filter(b => !(b.x === x && b.y === y));
  }
};

document.getElementById("play").onclick = () => {
  localStorage.setItem("funbox_map", JSON.stringify(blocks));
  location.href = "play.html";
};

document.getElementById("clear").onclick = () => {
  if(confirm("¿Borrar todo el mapa?")) blocks = [];
};

function loop() {
  // LÓGICA DE MOVIMIENTO DE CÁMARA
  if(keys.w) camY -= camSpeed;
  if(keys.s) camY += camSpeed;
  if(keys.a) camX -= camSpeed;
  if(keys.d) camX += camSpeed;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // DIBUJAR REJILLA (Se desplaza con la cámara)
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  // Calculamos el inicio de la rejilla para que parezca infinita
  let offsetX = (canvas.width / 2 - camX) % gridDisplaySize;
  let offsetY = (canvas.height / 2 - camY) % gridDisplaySize;

  for (let i = offsetX; i < canvas.width; i += gridDisplaySize) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
  }
  for (let j = offsetY; j < canvas.height; j += gridDisplaySize) {
    ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
  }

  // EJES CENTRALES (Indican el 0,0,0 del mundo 3D)
  ctx.strokeStyle = "#ff4444";
  ctx.lineWidth = 2;
  // Eje Y visual
  ctx.beginPath(); 
  ctx.moveTo(canvas.width / 2 - camX, 0); 
  ctx.lineTo(canvas.width / 2 - camX, canvas.height); 
  ctx.stroke();
  // Eje X visual
  ctx.beginPath(); 
  ctx.moveTo(0, canvas.height / 2 - camY); 
  ctx.lineTo(canvas.width, canvas.height / 2 - camY); 
  ctx.stroke();

  // DIBUJAR BLOQUES
  blocks.forEach(b => {
    // Posición de dibujo = (Posición lógica * tamaño) + Centro del canvas - Cámara
    const drawX = (b.x * gridDisplaySize) + (canvas.width / 2) - camX;
    const drawY = (b.y * gridDisplaySize) + (canvas.height / 2) - camY;

    // Solo dibujamos si están visibles en el canvas para optimizar
    if(drawX > -gridDisplaySize && drawX < canvas.width && drawY > -gridDisplaySize && drawY < canvas.height) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(drawX + 4, drawY + 4, 36, 36);
      
      ctx.fillStyle = "#2196f3"; 
      ctx.fillRect(drawX, drawY, 36, 36);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(drawX, drawY, 36, 10);
    }
  });

  requestAnimationFrame(loop);
}
loop();
