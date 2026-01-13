const content = document.getElementById("content");

document.getElementById("playBtn").onclick = () => {
  content.innerHTML = `
    <h2>🎮 Juegos</h2>
    <p>Aún no hay juegos publicados.</p>
  `;
};

document.getElementById("createBtn").onclick = () => {
  content.innerHTML = `
    <h2>🛠️ Crear</h2>
    <p>El editor estará disponible pronto.</p>
  `;
};

document.getElementById("loginBtn").onclick = () => {
  content.innerHTML = `
    <h2>👤 Login</h2>
    <input placeholder="Usuario"><br><br>
    <button>Entrar</button>
  `;
};
