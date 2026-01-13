const content = document.getElementById("content");

// ======================
// DATOS
// ======================
function getUser() {
  return localStorage.getItem("funbox_user");
}

function getGames() {
  return JSON.parse(localStorage.getItem("funbox_games")) || [];
}

// ======================
// LOGIN
// ======================
document.getElementById("loginBtn").onclick = function () {
  content.innerHTML = `
    <h2>👤 Login</h2>
    <input id="user" placeholder="Usuario"><br><br>
    <input id="pass" type="password" placeholder="Contraseña"><br><br>
    <button id="doLogin">Entrar</button>
  `;

  document.getElementById("doLogin").onclick = function () {
    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;

    if (!user || !pass) {
      alert("Completa todo");
      return;
    }

    localStorage.setItem("funbox_user", user);
    alert("Bienvenido " + user);
  };
};

// ======================
// CREAR
// ======================
document.getElementById("createBtn").onclick = function () {
  const user = getUser();
  if (!user) {
    alert("Inicia sesión primero");
    return;
  }

  content.innerHTML = `
    <h2>🛠 Crear Juego</h2>
    <input id="gameName" placeholder="Nombre del juego"><br><br>
    <textarea id="gameDesc" placeholder="Descripción"></textarea><br><br>
    <button id="saveGame">Guardar</button>
  `;

  document.getElementById("saveGame").onclick = function () {
    const games = getGames();
    games.push({
      name: document.getElementById("gameName").value,
      desc: document.getElementById("gameDesc").value,
      author: user
    });

    localStorage.setItem("funbox_games", JSON.stringify(games));
    alert("Juego creado 🚀");
  };
};

// ======================
// JUGAR
// ======================
document.getElementById("playBtn").onclick = function () {
  const games = getGames();

  if (games.length === 0) {
    content.innerHTML = "<h2>🎮 No hay juegos todavía</h2>";
    return;
  }

  let html = "<h2>🎮 Juegos de la Comunidad</h2>";

  games.forEach(game => {
    html += `
      <div style="border:1px solid #444;padding:10px;margin:10px 0">
        <h3>${game.name}</h3>
        <p>${game.desc}</p>
        <small>Por ${game.author}</small>
      </div>
    `;
  });

  content.innerHTML = html;
};

