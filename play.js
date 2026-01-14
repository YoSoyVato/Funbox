const content = document.getElementById("content");

let canvas, ctx;
let blocks = [];
let cam = { x: 0, y: 0 };
let mode = "place";

const SIZE = 40;

content.innerHTML = `
  <div class="editor-ui">
    <b>🧱 Funbox Engine</b><br><br>
    <button id="place">Colocar</button>
    <button id="delete">Borrar</button>
    <button id="play">🎮 Jugar</button>
    <button id="save">💾 Guardar</button>
  </div>
  <canvas id="canvas" width="900" height="500"></canvas>
`;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

document.getElementById("place").onclick = () => mode = "place";
document.getElementById("delete").onclick = () => mode = "delete";
document.getElementById("play").onclick = () => {
  localStorage.setItem("funbox_play_map", JSON.stringify(blocks));
  location.href = "play.html";
};
document.getElementById("save").onclick = () => {
  localStorage.setItem("funbox_saved_map", JSON.stringify(blocks));
  alert("Mapa guardado");
};

canvas.oncontextmenu = e => e.preventDefault();
canvas.addEventListener("mousedown", onMouse);
window.addEventListener("keydown", moveCam);

function grid(e) {
  return {
    x: Math.floor((e.offsetX + cam.x) / SIZE),
    y: Math.floor((e.offsetY + cam.y) / SIZE)
  };
}

function onMouse(e) {
  const { x, y } = grid(e);

  if (mode === "place") {
    let z = 0;
    while (blocks.find(b => b.x === x && b.y === y && b.z === z)) z++;
    blocks.push({ x, y, z });
  }

  if (mode === "delete") {
    const stack = blocks.filter(b => b.x === x && b.y === y);
    const top = Math.max(-1, ...stack.map(b => b.z));
    blocks = blocks.filter(b => !(b.x === x && b.y === y && b.z === top));
  }
}

function moveCam(e) {
  if (e.key === "w") cam.y -= 20;
  if (e.key === "s") cam.y += 20;
  if (e.key === "a") cam.x -= 20;
  if (e.key === "d") cam.x += 20;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blocks.sort((a, b) => a.z - b.z).forEach(b => {
    ctx.fillStyle = `hsl(${180 - b.z * 10},80%,60%)`;
    ctx.fillRect(
      b.x * SIZE - cam.x,
      b.y * SIZE - cam.y - b.z * 12,
      SIZE - 2,
      SIZE - 2
    );
  });

  requestAnimationFrame(loop);
}
loop();
