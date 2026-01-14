const content = document.getElementById("content");

// Intentar cargar mapa previo
let blocks = JSON.parse(localStorage.getItem("funbox_map")) || [];
let canvas, ctx;

const gridDisplaySize = 40; // Tamaño visual de la celda en el editor
const worldHalfSize = 250;  // La mitad de 500 para centrar el mundo

content.innerHTML = `
  <div style="background: #222; padding: 10px; border-radius: 10px; display: inline-block; text-align: center;">
    <h3 style="color: white; font-family: sans-serif; margin-bottom: 10px;">Mundo 500x500 (Centro en Ejes)</h3>
    <canvas id="canvas" width="800" height="600" style="cursor: crosshair; background: #333; border: 2px solid #555;"></canvas>
    <div style="margin-top: 10px;">
      <button id="play" style="background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">🎮 Jugar Mapa</button>
      <button id="clear" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">🗑️ Limpiar Todo</button>
    </div>
    <p style="color: #888; font-family: sans-serif; font-size: 12px; margin-top: 5px;">El centro de la rejilla es el punto de aparición (0,0,0)</p>
  </div>
`;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

canvas.oncontextmenu = (e) => e.preventDefault();

canvas.onmousedown = e => {
  // Calculamos la posición relativa al centro del canvas para que coincida con el mundo 3D
  const x = Math.floor((e.offsetX - canvas.width / 2) / gridDisplaySize);
  const y = Math.floor((e.offsetY - canvas.height / 2) / gridDisplaySize);

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar Rejilla de guía
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += gridDisplaySize) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
  }
  for (let j = 0; j < canvas.height; j += gridDisplaySize) {
    ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
  }

  // Dibujar Ejes Centrales (Para saber donde está el 0,0)
  ctx.strokeStyle = "#ff4444";
  ctx.lineWidth = 2;
  // Eje Y (Vertical)
  ctx.beginPath(); ctx.moveTo(canvas.width/2, 0); ctx.lineTo(canvas.width/2, canvas.height); ctx.stroke();
  // Eje X (Horizontal)
  ctx.beginPath(); ctx.moveTo(0, canvas.height/2); ctx.lineTo(canvas.width, canvas.height/2); ctx.stroke();

  // Dibujar Bloques
  blocks.forEach(b => {
    // Convertimos la coordenada lógica (-10, 5, etc) a píxeles del canvas
    const drawX = (b.x * gridDisplaySize) + (canvas.width / 2);
    const drawY = (b.y * gridDisplaySize) + (canvas.height / 2);

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(drawX + 4, drawY + 4, 36, 36);
    
    ctx.fillStyle = "#2196f3"; 
    ctx.fillRect(drawX, drawY, 36, 36);
    
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(drawX, drawY, 36, 10);
  });

  requestAnimationFrame(loop);
}
loop();
