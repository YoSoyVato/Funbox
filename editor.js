const content = document.getElementById("content");

// 1. CARGAR CONFIGURACIÓN INTEGRADA
let blocks = JSON.parse(localStorage.getItem("funbox_map")) || [];

if (blocks.length === 0) {
    blocks.push({ x: 0, y: 0, type: "spawn" });
}

let gameConfig = JSON.parse(localStorage.getItem("funbox_config")) || { 
    floorColor: "#eeeeee", 
    floorSize: 500,
    skyColor: "#87ceeb", 
    ambientIntensity: 0.9 
};

let customScriptCode = localStorage.getItem("funbox_custom_script") || "// Escribe tu código PRO aquí\n// Ejemplo: game.setFloor('red');";

let canvas, ctx;
const gridDisplaySize = 40; 
const camSpeed = 8; 
let camX = 0, camY = 0;
const keys = {};

let currentTool = "block";

content.innerHTML = `
<div style="display: flex; background: #1a1a1a; color: white; font-family: sans-serif; height: 90vh; border-radius: 10px; overflow: hidden; border: 1px solid #444; position: relative;">
    
    <div id="box-assets-bar" style="position: absolute; left: 20px; top: 65px; display: flex; gap: 8px; background: rgba(30, 30, 30, 0.9); padding: 8px; border-radius: 10px; border: 1px solid #444; z-index: 100; align-items: center;">
        <span style="font-size: 10px; font-weight: bold; color: #888; margin-right: 5px;">📦 BOXASSETS:</span>
        <button onclick="currentTool='block'" class="asset-btn active" title="Bloque">🟦</button>
        <button onclick="currentTool='chair'" class="asset-btn" title="Silla">🪑</button>
        <button onclick="currentTool='table'" class="asset-btn" title="Mesa">🧱</button>
        <button onclick="currentTool='bed'" class="asset-btn" title="Cama">🛏️</button>
        <button onclick="currentTool='pc'" class="asset-btn" title="Computadora">🖥️</button>
        <button onclick="currentTool='flashlight'" class="asset-btn" title="Linterna">🔦</button>
    </div>

    <style>
        .asset-btn { background: #333; border: 1px solid #555; cursor: pointer; padding: 5px; border-radius: 5px; font-size: 16px; transition: 0.2s; }
        .asset-btn:hover { background: #444; transform: translateY(-2px); }
        .asset-btn.active { border-color: #2196f3; background: #1a3a5a; }
        .workspace-item { cursor: pointer; transition: 0.2s; }
        .workspace-item:hover { background: #444 !important; }
        /* Scrollbar para la consola */
        #editor-console::-webkit-scrollbar { width: 8px; }
        #editor-console::-webkit-scrollbar-thumb { background: #444; border-radius: 4px; }
    </style>

    <div style="flex: 1; display: flex; flex-direction: column; background: #222;">
        <div style="padding: 10px; background: #2d2d2d; border-bottom: 1px solid #3d3d3d; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: #ccc;">🏗️ Funbox Studio</span>
            <div>
                <button id="play" style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold;">🎮 JUGAR</button>
                <button id="clear" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; margin-left: 10px;">🗑️ LIMPIAR</button>
            </div>
        </div>
        <canvas id="canvas" style="cursor: crosshair; background: #111; flex: 1;"></canvas>
        
        <div id="editor-console" style="background: #0a0a0a; color: #00ff00; font-family: 'Courier New', monospace; font-size: 12px; padding: 12px; border-top: 2px solid #333; height: 130px; overflow-y: auto; white-space: pre-wrap; line-height: 1.4;">
            <div style="color: #666;">> Funbox Studio Console v1.0 - Lista para scripts.</div>
        </div>
    </div>

    <div style="width: 280px; background: #252525; border-left: 1px solid #444; display: flex; flex-direction: column;">
        <div style="padding: 10px; background: #333; font-weight: bold; color: #888; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #444;">Explorador</div>
        <div style="flex: 1; padding: 10px; overflow-y: auto;">
            <div style="margin-bottom: 10px;">
                <span style="color: #ffd700;">📂</span> <strong>Workspace</strong>
                <div class="workspace-item" style="margin-left: 20px; margin-top: 8px; padding: 5px 10px; background: #3d3d3d; border: 1px solid #4db8ff; border-radius: 4px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">🟦</span> Baseplate
                </div>
                <div class="workspace-item" style="margin-left: 20px; margin-top: 4px; padding: 5px 10px; background: #3d3d3d; border: 1px solid #ffffff; border-radius: 4px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">⬜</span> SpawnLocation
                </div>
                <div id="open-script" class="workspace-item" style="margin-left: 20px; margin-top: 4px; padding: 5px 10px; background: #2d4a3e; border: 1px solid #4caf50; border-radius: 4px; display: flex; align-items: center;">
                    <span style="margin-right: 8px;">📜</span> Script
                </div>
            </div>
        </div>

        <div style="background: #1e1e1e; border-top: 2px solid #333; padding-bottom: 20px;">
            <div style="padding: 8px; background: #2d2d2d; font-size: 10px; color: #888; text-transform: uppercase;">Propiedades Globales</div>
            <div style="padding: 15px;">
                <label style="display: block; font-size: 11px; color: #888; margin-bottom: 5px;">BASEPLATE</label>
                <input type="color" id="floorColor" value="${gameConfig.floorColor}" style="width: 100%; height: 25px; border: none; background: #333; cursor: pointer; margin-bottom: 10px;">
                <input type="number" id="floorSize" value="${gameConfig.floorSize}" min="10" max="3500" style="width: 100%; background: #333; border: 1px solid #444; color: white; padding: 4px; border-radius: 4px; margin-bottom: 15px;">
                
                <label style="display: block; font-size: 11px; color: #888; margin-bottom: 5px;">AMBIENTE (CIELO)</label>
                <select id="skyPreset" style="width: 100%; background: #333; color: white; border: 1px solid #444; padding: 6px; border-radius: 4px;">
                    <option value="#87ceeb" ${gameConfig.skyColor === "#87ceeb" ? "selected" : ""}>☀️ Día</option>
                    <option value="#ffb347" ${gameConfig.skyColor === "#ffb347" ? "selected" : ""}>🌅 Atardecer</option>
                    <option value="#1a1a2e" ${gameConfig.skyColor === "#1a1a2e" ? "selected" : ""}>🌙 Noche</option>
                </select>
            </div>
        </div>
    </div>
</div>
`;

canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
const editorConsole = document.getElementById("editor-console");

// Función para imprimir mensajes en la consola visual
function printToConsole(msg, color = "#00ff00") {
    const line = document.createElement("div");
    line.style.color = color;
    line.textContent = `> ${msg}`;
    editorConsole.appendChild(line);
    editorConsole.scrollTop = editorConsole.scrollHeight;
}

// LÓGICA DE INPUTS
document.getElementById("floorColor").oninput = (e) => gameConfig.floorColor = e.target.value;
document.getElementById("floorSize").oninput = (e) => {
    let val = parseInt(e.target.value);
    gameConfig.floorSize = val > 3500 ? 3500 : (val || 10);
};
document.getElementById("skyPreset").onchange = (e) => {
    gameConfig.skyColor = e.target.value;
    gameConfig.ambientIntensity = (e.target.value === "#1a1a2e") ? 0.3 : 0.9;
};

// MODIFICADO: Sistema de Scripting con SEGURIDAD y CONSOLA
document.getElementById("open-script").onclick = () => {
    const inputCode = prompt("📜 SCRIPT EDITOR (PRO):\nEscribe tu código JavaScript. Usa 'game' para interactuar.", customScriptCode);
    
    if (inputCode !== null) {
        // 1. SEGURIDAD (ANTI-MALWARE)
        const forbiddenWords = ["while", "setInterval", "localStorage", "location", "document", "window", "fetch", "XMLHttpRequest"];
        let isMalicious = false;
        let detectedWord = "";

        for (let word of forbiddenWords) {
            if (inputCode.toLowerCase().includes(word.toLowerCase())) {
                isMalicious = true;
                detectedWord = word;
                break;
            }
        }

        if (inputCode.match(/for\s*\(\s*;\s*;\s*\)/)) isMalicious = true;

        if (isMalicious) {
            printToConsole("❌ ERROR DE SEGURIDAD: Uso prohibido de: " + detectedWord, "#ff4444");
            alert("Error de seguridad detectado. Revisa la consola.");
        } else {
            // 2. VALIDACIÓN DE SINTAXIS (CONSOLA)
            try {
                new Function('game', inputCode); // Prueba de compilación
                customScriptCode = inputCode;
                localStorage.setItem("funbox_custom_script", customScriptCode); 
                printToConsole("✅ Script verificado y guardado con éxito.", "#4caf50");
            } catch (e) {
                printToConsole("❌ ERROR DE SINTAXIS:\n" + e.message, "#ff4444");
                alert("Tu código tiene errores. Revisa la consola.");
            }
        }
    }
};

document.querySelectorAll('.asset-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.asset-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
canvas.oncontextmenu = (e) => e.preventDefault();

canvas.onmousedown = e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left + camX - canvas.width / 2) / gridDisplaySize);
    const y = Math.floor((e.clientY - rect.top + camY - canvas.height / 2) / gridDisplaySize);
    
    if (e.button === 0) { 
        if (!blocks.find(b => b.x === x && b.y === y)) {
            blocks.push({ x, y, type: currentTool });
        }
    } else if (e.button === 2) { 
        blocks = blocks.filter(b => !(b.x === x && b.y === y && b.type !== "spawn"));
    }
};

document.getElementById("play").onclick = () => {
    localStorage.setItem("funbox_map", JSON.stringify(blocks));
    localStorage.setItem("funbox_config", JSON.stringify(gameConfig));
    localStorage.setItem("funbox_custom_script", customScriptCode); 
    location.href = "play.html";
};

document.getElementById("clear").onclick = () => { 
    if(confirm("¿Borrar todo? (Se limpiarán los bloques y el script)")) {
        blocks = [{ x: 0, y: 0, type: "spawn" }]; 
        customScriptCode = "// Escribe tu código PRO aquí\n// Ejemplo: game.setFloor('red');";
        localStorage.removeItem("funbox_custom_script");
        localStorage.removeItem("funbox_map");
        printToConsole("🧹 Workspace limpiado.", "#888");
        alert("Todo limpio.");
    }
};

function loop() {
    if(keys.w) camY -= camSpeed; if(keys.s) camY += camSpeed;
    if(keys.a) camX -= camSpeed; if(keys.d) camX += camSpeed;

    if (canvas.width !== canvas.clientWidth) { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const visualSize = gameConfig.floorSize * (gridDisplaySize / 1);
    ctx.fillStyle = gameConfig.floorColor;
    ctx.fillRect((canvas.width/2 - camX) - visualSize/2, (canvas.height/2 - camY) - visualSize/2, visualSize, visualSize);

    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    let offsetX = (canvas.width / 2 - camX) % gridDisplaySize;
    let offsetY = (canvas.height / 2 - camY) % gridDisplaySize;
    for (let i = offsetX; i < canvas.width; i += gridDisplaySize) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for (let j = offsetY; j < canvas.height; j += gridDisplaySize) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke(); }

    blocks.forEach(b => {
        const drawX = (b.x * gridDisplaySize) + (canvas.width / 2) - camX;
        const drawY = (b.y * gridDisplaySize) + (canvas.height / 2) - camY;
        if(b.type === "spawn") ctx.fillStyle = "#ffffff";
        else if(b.type === "block") ctx.fillStyle = "#2196f3";
        else ctx.fillStyle = "#ff9800"; 
        ctx.fillRect(drawX, drawY, gridDisplaySize, gridDisplaySize);
        if(b.type === "spawn") {
            ctx.strokeStyle = "#4db8ff";
            ctx.strokeRect(drawX, drawY, gridDisplaySize, gridDisplaySize);
        }
        if(b.type !== "block" && b.type !== "spawn") {
            ctx.fillStyle = "white"; ctx.font = "20px Arial";
            const icons = { chair:"🪑", table:"🧱", bed:"🛏️", pc:"🖥️", flashlight:"🔦" };
            ctx.fillText(icons[b.type] || "📦", drawX + 10, drawY + 28);
        }
    });
    requestAnimationFrame(loop);
}
loop();
