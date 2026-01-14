const content = document.getElementById("content");

// 1. Cargar datos guardados (Mapa + Configuración del Suelo)
let blocks = JSON.parse(localStorage.getItem("funbox_map")) || [];
let floorConfig = JSON.parse(localStorage.getItem("funbox_floor_config")) || { color: "#eeeeee", size: 500 };

let canvas, ctx;
const gridDisplaySize = 40; 
const camSpeed = 8; 

let camX = 0;
let camY = 0;
const keys = {};

// 2. Estructura Profesional con Panel Lateral "ACA"
content.innerHTML = `
<div style="display: flex; background: #1a1a1a; color: white; font-family: sans-serif; height: 90vh; border-radius: 10px; overflow: hidden; border: 1px solid #444;">
    
    <div style="flex: 1; display: flex; flex-direction: column; background: #222;">
        <div style="padding: 10px; background: #2d2d2d; border-bottom: 1px solid #3d3d3d; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: #ccc;">🏗️ Funbox Studio</span>
            <div>
                <button id="play" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold;">🎮 JUGAR</button>
                <button id="clear" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-left: 10px;">🗑️ LIMPIAR</button>
            </div>
        </div>
        <canvas id="canvas" style="cursor: crosshair; background: #333; flex: 1;"></canvas>
    </div>

    <div style="width: 280px; background: #252525; border-left: 1px solid #444; display: flex; flex-direction: column;">
        <div style="padding: 10px; background: #333; font-weight: bold; color: #888; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #444;">Explorador</div>
        
        <div style="flex: 1; padding: 10px; overflow-y: auto;">
            <div style="margin-bottom: 5px;">
                <span style="color: #ffd700;">📂</span> <strong>Workspace</strong>
                <div style="margin-left: 20px; margin-top: 8px; padding: 5px 10px; background: #3d3d3d; border: 1px solid #4db8ff; border-radius: 4px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🟦</span> Baseplate
                </div>
            </div>
            <div style="margin-top: 15px; color: #aaa; font-size: 13px;">📂 StarterPlayer</div>
        </div>

        <div style="background: #1e1e1e; border-top: 2px solid #333; padding-bottom: 20px;">
            <div style="padding: 8px; background: #2d2d2d; font-size: 10px; color: #888; text-transform: uppercase;">Propiedades - Baseplate</div>
            <div style="padding: 15px;">
                <label style="display: block; font-size: 12px; color: #bbb; margin-bottom: 5px;">Color</label>
                <input type="color" id="floorColor" value="${floorConfig.color}" style="width: 100%; height: 30px; border: none; background: #333; cursor: pointer; margin-bottom: 15px;">
                
                <label style="display: block; font-size: 12px; color: #bbb; margin-bottom: 5px;">Tamaño (Máx 3.500)</label>
                <input type="number" id="floorSize" value="${floorConfig.size}" min="10" max="3500" 
                    style="width: 100%; background: #333; border: 1px solid #444; color: white; padding: 6px; border-radius: 4px;">
            </div>
        </div>
    </div>
</div>
`;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

// 3. Lógica de Inputs (Propiedades)
document.getElementById("floorColor").oninput = (e) => floorConfig.color = e.target.value;
document.getElementById("floorSize").oninput = (e) => {
    let val = parseInt(e.target.value);
    if (val > 3500) val = 3500;
    floorConfig.size = val || 10;
};

// Captura de teclado para WASD
window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.oncontextmenu = (e) => e.preventDefault();

canvas.onmousedown = e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left + camX - canvas.width / 2) / gridDisplaySize);
    const y = Math.floor((e.clientY - rect.top + camY - canvas.height / 2) / gridDisplaySize);

    if (e.button === 0) { 
        if (!blocks.find(b => b.x === x && b.y === y)) {
            blocks.push({ x, y, z: 0 });
        }
    } else if (e.button === 2) { 
        blocks = blocks.filter(b => !(b.x === x && b.y === y));
    }
};

document.getElementById("play").onclick = () => {
    localStorage.setItem("funbox_map", JSON.stringify(blocks));
    localStorage.setItem("funbox_floor_config", JSON.stringify(floorConfig));
    location.href = "play.html";
};

document.getElementById("clear").onclick = () => {
    if(confirm("¿Borrar todo el mapa?")) blocks = [];
};

function loop() {
    if(keys.w) camY -= camSpeed;
    if(keys.s) camY += camSpeed;
    if(keys.a) camX -= camSpeed;
    if(keys.d) camX += camSpeed;

    // Asegurar que el canvas use el espacio disponible
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let offsetX = (canvas.width / 2 - camX) % gridDisplaySize;
    let offsetY = (canvas.height / 2 - camY) % gridDisplaySize;

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    for (let i = offsetX; i < canvas.width; i += gridDisplaySize) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let j = offsetY; j < canvas.height; j += gridDisplaySize) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(canvas.width / 2 - camX, 0); ctx.lineTo(canvas.width / 2 - camX, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, canvas.height / 2 - camY); ctx.lineTo(canvas.width, canvas.height / 2 - camY); ctx.stroke();

    blocks.forEach(b => {
        const drawX = (b.x * gridDisplaySize) + (canvas.width / 2) - camX;
        const drawY = (b.y * gridDisplaySize) + (canvas.height / 2) - camY;

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
