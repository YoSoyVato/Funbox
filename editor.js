const content = document.getElementById("content");

// Intentar cargar mapa previo si existe
let blocks = JSON.parse(localStorage.getItem("funbox_map")) || [];
let canvas, ctx;

content.innerHTML = `
  <div style="background: #222; padding: 10px; border-radius: 10px; display: inline-block;">
    <canvas id="canvas" width="800" height="500" style="cursor: crosshair; background: #333; border: 2px solid #555;"></canvas>
    <div style="margin-top: 10px;">
      <button id="play" style="background: #4caf50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">🎮 Jugar Mapa</button>
      <button id="clear" style="background: #f44336; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">🗑️ Limpiar Todo</button>
    </div>
    <p style="color: #ccc; font-family: sans-serif; font-size: 12px; margin-top: 5px;">Click Izquierdo: Poner bloque | Click Derecho: Borrar</p>
  </div>
`;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

// Evitar menú contextual al borrar con click derecho
canvas.oncontextmenu = (e) => e.preventDefault();

canvas.onmousedown = e => {
  const x = Math.floor(e.offsetX / 40);
  const y = Math.floor(e.offsetY / 40);

  if (e.button === 0) { // Click Izquierdo: Agregar
    // Evitar duplicados en la misma celda
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
  if(confirm("¿Seguro que quieres borrar todo el mapa?")) blocks = [];
};

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar Rejilla de guía
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1;
  for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
  }
  for (let j = 0; j < canvas.height; j += 40) {
    ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
  }

  // Dibujar Bloques
  blocks.forEach(b => {
    // Sombra del bloque
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(b.x * 40 + 4, b.y * 40 + 4, 36, 36);
    
    // Bloque principal (Color Funbox)
    ctx.fillStyle = "#2196f3"; 
    ctx.fillRect(b.x * 40, b.y * 40, 36, 36);
    
    // Brillo superior
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(b.x * 40, b.y * 40, 36, 10);
  });

  requestAnimationFrame(loop);
}
loop();
