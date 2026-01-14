const content = document.getElementById("content");

let blocks = [];
let canvas, ctx;

content.innerHTML = `
  <button id="play">🎮 Jugar</button>
  <canvas id="canvas" width="800" height="500"></canvas>
`;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

canvas.onclick = e => {
  const x = Math.floor(e.offsetX / 40);
  const y = Math.floor(e.offsetY / 40);
  blocks.push({ x, y, z: 0 });
};

document.getElementById("play").onclick = () => {
  localStorage.setItem("funbox_map", JSON.stringify(blocks));
  location.href = "play.html";
};

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  blocks.forEach(b => {
    ctx.fillStyle = "#4af";
    ctx.fillRect(b.x * 40, b.y * 40, 38, 38);
  });
  requestAnimationFrame(loop);
}
loop();
