const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const SIZE = 40;
let cam = { x: 0, y: 0 };
let map = JSON.parse(localStorage.getItem("funbox_map")) || [];

window.addEventListener("keydown", moveCam);

function moveCam(e) {
  if (e.key === "w") cam.y -= 20;
  if (e.key === "s") cam.y += 20;
  if (e.key === "a") cam.x -= 20;
  if (e.key === "d") cam.x += 20;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  map.forEach(b => {
    ctx.fillStyle = "#2196f3";
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
