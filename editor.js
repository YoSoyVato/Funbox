const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const SIZE = 40;
let cam = { x: 0, y: 0 };
let blocks = JSON.parse(localStorage.getItem("funbox_map")) || [];

canvas.oncontextmenu = e => e.preventDefault();
canvas.addEventListener("mousedown", onClick);
window.addEventListener("keydown", moveCam);

function gridPos(e) {
  return {
    x: Math.floor((e.offsetX + cam.x) / SIZE),
    y: Math.floor((e.offsetY + cam.y) / SIZE)
  };
}

function onClick(e) {
  const { x, y } = gridPos(e);

  if (e.button === 0) {
    blocks.push({ x, y });
  }

  if (e.button === 2) {
    blocks = blocks.filter(b => !(b.x === x && b.y === y));
  }
}

function moveCam(e) {
  if (e.key === "w") cam.y -= 20;
  if (e.key === "s") cam.y += 20;
  if (e.key === "a") cam.x -= 20;
  if (e.key === "d") cam.x += 20;
}

function saveMap() {
  localStorage.setItem("funbox_map", JSON.stringify(blocks));
  alert("Mapa guardado 🚀");
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  blocks.forEach(b => {
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(
      b.x * SIZE - cam.x,
      b.y * SIZE - cam.y,
      SIZE - 2,
      SIZE - 2
    );
  });

  requestAnimationFrame(loop);
}

loop();
