window.onload = function () {

  const content = document.getElementById("content");

  document.getElementById("playBtn").addEventListener("click", () => {
    content.innerHTML = "<h2>🎮 Modo Jugar</h2><p>Esto FUNCIONA.</p>";
  });

  document.getElementById("createBtn").addEventListener("click", () => {
    content.innerHTML = "<h2>🛠 Modo Crear</h2><p>Editor próximamente.</p>";
  });

  document.getElementById("loginBtn").addEventListener("click", () => {
    content.innerHTML = "<h2>👤 Login</h2><p>Login funcionando.</p>";
  });

};
