window.onload = function () {

  const content = document.getElementById("content");

  // =========================
  // UTILIDADES
  // =========================
  function getUser() {
    return localStorage.getItem("funbox_user");
  }

  function getGames() {
    return JSON.parse(localStorage.getItem("funbox_games")) || [];
  }

  function saveGames(games) {
    localStorage.setItem("funbox_games", JSON.stringify(games));
  }

  // =========================
  // LOGIN
  // =========================
  document.getElementById("loginBtn").addEventListener("click", () => {
    content.innerHTML = `
      <h2>👤 Login</h2>

      <input id="user" placeholder="Usuario"><br><br>
      <input id="pass" type="password" placeholder="Contraseña"><br><br>

      <button id="doLogin">Entrar</button>
    `;

    document.getElementById("doLogin").onclick = () => {
      const user = document.getElementById("user").value;
      const pass = document.getElementById("pass").value;

      if (!user || !pass) {
        alert("Completa todos los campos");
        return;
      }

      localStorage.setItem("funbox_user", user);
      alert("Bienvenido " + user + " 🎉");
    };
  });

  // =========================
  // CREAR JUEGO
  // =========================
  document.getElementById("createBtn").addEventListener("click", () => {
    const user = getUser();

    if (!user) {
      alert("Tenés que iniciar sesión primero");
      return;
    }

    content.innerHTML = `
      <h2>🛠 Crear Juego</h2>

      <input id="gameName" placeholder="Nombre del juego"><br><br>
      <textarea id="gameDesc" placeholder="Descripción del juego"></textarea><br><br>

      <button id="saveGame">Guardar Juego</button>
    `;

    document.getElementById("saveGame").onclick = () => {
      const name = document.getElementById("gameName").value;
      const desc = document.getElementById("gameDesc").value;

      if (!name || !desc) {
        alert("Completa todo");
        return;
      }

      const games = getGames();

      games.push({
        name: name,
        desc: desc,
        author: user
      });

      saveGames(games);
      alert("Juego creado correctamente 🚀");
    };
  });

  // =========================
  // JUGAR (COMUNIDAD)
  // =========================
  document.getElementById("playBtn").addEventListener("click", () => {
    const games = getGames();

    if (games.length === 0) {
      content.innerHTML = `
        <h2>🎮 Jugar</h2>
        <p>No hay juegos creados aún.</p>
      `;
      return;
    }

    let html = "<h2>🎮 Juegos de la Comunidad</h2>";

    games.forEach((game, i) => {
      html += `
        <div style="border:1px solid #444; padding:10px; margin-bottom:10px">
          <h3>${game.name}</h3>
          <p>${game.desc}</p>
          <small>Creado por: ${game.author}</small>
        </div>
      `;
    });

    content.innerHTML = html;
  });

};
