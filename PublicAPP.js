// public/app.js - Frontend that talks to the Express API + Socket.IO
const API = '';
const socket = io(); // connects to same host

// Helpers
const el = q => document.querySelector(q);
const navRight = el('#navRight');

let currentUser = null;
let gamesCache = [];
let joinedGameId = null;

// --- Auth UI ---
function showAuthPanel(){
  const authModal = el('#authModal');
  const body = el('#authBody');
  body.innerHTML = `
    <h2>Entrar / Registrar</h2>
    <div style="display:flex; gap:8px; margin-top:12px;">
      <input id="authUser" placeholder="usuario" style="padding:8px; border-radius:8px; width:160px;">
      <input id="authPass" type="password" placeholder="contraseña" style="padding:8px; border-radius:8px; width:160px;">
    </div>
    <div style="margin-top:12px;">
      <button class="btn primary" id="btnLogin">Entrar</button>
      <button class="btn ghost" id="btnRegister">Registrar</button>
    </div>
    <p style="color:var(--muted); margin-top:10px;">Cuenta demo: usuario <code>demo</code>, cualquier contraseña no funciona (demo tiene su propia hash).</p>
  `;
  authModal.classList.remove('hidden');
  el('#authClose').addEventListener('click', ()=> authModal.classList.add('hidden'));
  el('#btnLogin').addEventListener('click', handleLogin);
  el('#btnRegister').addEventListener('click', handleRegister);
}

async function handleRegister(){
  const username = el('#authUser').value.trim();
  const password = el('#authPass').value;
  if(!username || !password) return alert('username & password required');
  try{
    const res = await fetch(`${API}/api/register`, { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if(!res.ok) return alert(data.error || 'error');
    localStorage.setItem('token', data.token);
    currentUser = data.user;
    refreshAuthUI();
    el('#authModal').classList.add('hidden');
  }catch(err){ console.error(err); alert('error'); }
}

async function handleLogin(){
  const username = el('#authUser').value.trim();
  const password = el('#authPass').value;
  if(!username || !password) return alert('username & password required');
  try{
    const res = await fetch(`${API}/api/login`, { method:'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) });
    const data = await res.json();
    if(!res.ok) return alert(data.error || 'error');
    localStorage.setItem('token', data.token);
    currentUser = data.user;
    refreshAuthUI();
    el('#authModal').classList.add('hidden');
  }catch(err){ console.error(err); alert('error'); }
}

async function refreshAuthUI(){
  const token = localStorage.getItem('token');
  if(!token){ navRight.innerHTML = `<button class="btn ghost" id="createBtn">Crear</button> <button class="btn" id="loginBtn">Entrar</button>`; attachNavEvents(); return; }
  try{
    const res = await fetch(`${API}/api/me`, { headers: { Authorization: 'Bearer ' + token }});
    if(!res.ok) throw new Error('not auth');
    const user = await res.json();
    currentUser = user;
    navRight.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center;">
        <img src="${user.avatar}" style="width:34px; height:34px; border-radius:8px; object-fit:cover;">
        <span style="color:var(--muted); margin-right:8px;">${user.username}</span>
        <button class="btn ghost" id="btnCreate">Crear</button>
        <button class="btn" id="btnLogout">Salir</button>
      </div>`;
    document.getElementById('btnLogout').addEventListener('click', ()=>{ localStorage.removeItem('token'); currentUser=null; refreshAuthUI(); });
    document.getElementById('btnCreate').addEventListener('click', showCreatePanel);
  }catch(err){
    localStorage.removeItem('token');
    navRight.innerHTML = `<button class="btn ghost" id="createBtn">Crear</button> <button class="btn" id="loginBtn">Entrar</button>`;
    attachNavEvents();
  }
}

function attachNavEvents(){
  el('#loginBtn')?.addEventListener('click', showAuthPanel);
  el('#createBtn')?.addEventListener('click', showCreatePanel);
}

// --- Create panel ---
function showCreatePanel(){
  if(!currentUser){
    showAuthPanel();
    return;
  }
  const modal = el('#modal');
  const body = el('#modalBody');
  body.innerHTML = `
    <h2>Crear juego</h2>
    <div style="display:flex; flex-direction:column; gap:8px; margin-top:12px;">
      <input id="gameTitle" placeholder="Título" style="padding:8px; border-radius:8px;">
      <input id="gameThumb" placeholder="URL de thumbnail (opcional)" style="padding:8px; border-radius:8px;">
      <textarea id="gameDesc" placeholder="Descripción" style="padding:8px; border-radius:8px;"></textarea>
      <div style="display:flex; gap:8px;">
        <button class="btn primary" id="btnCreateGame">Crear</button>
        <button class="btn ghost" id="btnCancelCreate">Cancelar</button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
  el('#modalClose').addEventListener('click', closeModal);
  el('#btnCancelCreate').addEventListener('click', closeModal);
  el('#btnCreateGame').addEventListener('click', async ()=>{
    const title = el('#gameTitle').value.trim();
    const desc = el('#gameDesc').value.trim();
    const thumb = el('#gameThumb').value.trim();
    if(!title) return alert('Título requerido');
    try{
      const res = await fetch(`${API}/api/games`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
        body: JSON.stringify({ title, desc, thumb })
      });
      const data = await res.json();
      if(!res.ok) return alert(data.error || 'error creando');
      closeModal();
      loadGames();
    }catch(err){ console.error(err); alert('error'); }
  });
}

function closeModal(){ el('#modal').classList.add('hidden'); }

// --- Games render & search ---
function renderGames(games){
  const grid = el('#gamesGrid');
  grid.innerHTML = '';
  games.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.id = g.id;
    card.innerHTML = `
      <img class="game-thumb" src="${g.thumb}" alt="${g.title}">
      <div class="game-body">
        <h4 class="game-title">${g.title}</h4>
        <div class="game-meta">
          <span class="players-count" data-id="${g.id}">${formatPlayers(g.players)} jugando</span>
          <button class="play-small" data-id="${g.id}">Jugar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function formatPlayers(n){ if(n >= 1000) return (n/1000).toFixed(1)+'k'; return n.toString(); }

el('#searchInput').addEventListener('input', e=>{
  const q = e.target.value.toLowerCase().trim();
  const filtered = gamesCache.filter(g => g.title.toLowerCase().includes(q));
  renderGames(filtered);
});

el('#gamesGrid').addEventListener('click', e=>{
  const playBtn = e.target.closest('.play-small');
  if(playBtn){
    const id = playBtn.dataset.id;
    startPlay(id);
    return;
  }
  const card = e.target.closest('.game-card');
  if(card){
    const id = card.dataset.id;
    openGameModal(id);
  }
});

// --- Featured buttons ---
el('#featuredPlay').addEventListener('click', ()=> {
  if(gamesCache[0]) startPlay(gamesCache[0].id);
});
el('#featuredMore').addEventListener('click', ()=> {
  if(gamesCache[0]) openGameModal(gamesCache[0].id);
});

// --- Game modal & play flow ---
function openGameModal(id){
  const g = gamesCache.find(x=>String(x.id) === String(id));
  if(!g) return;
  const modal = el('#modal');
  const body = el('#modalBody');
  body.innerHTML = `
    <div style="display:flex; gap:16px; align-items:flex-start;">
      <img src="${g.thumb}" alt="${g.title}" style="width:300px; border-radius:8px; object-fit:cover;">
      <div>
        <h2 style="margin-top:0">${g.title}</h2>
        <p style="color:var(--muted)">${g.desc}</p>
        <p style="color:var(--muted)"><span id="modalPlayers">${formatPlayers(g.players)}</span> jugando</p>
        <div style="margin-top:12px">
          <button class="btn primary" id="modalPlay">Entrar</button>
          <button class="btn ghost" id="modalCloseBtn">Cerrar</button>
        </div>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
  el('#modalClose')?.addEventListener('click', closeModal);
  el('#modalCloseBtn')?.addEventListener('click', closeModal);
  el('#modalPlay')?.addEventListener('click', ()=>{ startPlay(g.id); closeModal(); });
}

async function startPlay(id){
  // call play endpoint (increments stored visits)
  try{
    await fetch(`${API}/api/games/${id}/play`, { method:'POST' });
  }catch(err){ console.warn('play api error', err); }
  // join socket room (logical)
  joinedGameId = String(id);
  socket.emit('joinGame', { gameId: joinedGameId });

  // open a small playing panel
  const modal = el('#modal');
  const body = el('#modalBody');
  body.innerHTML = `
    <h3>Jugando ahora</h3>
    <p id="playingTitle" style="font-weight:600; margin-top:6px;">${gamesCache.find(g=>String(g.id)===joinedGameId)?.title || ''}</p>
    <p style="color:var(--muted)">Estás dentro de la partida. Cuando salgas, dejarás la partida y el contador se actualizará.</p>
    <div style="margin-top:12px;">
      <button class="btn ghost" id="btnLeave">Salir</button>
    </div>
  `;
  modal.classList.remove('hidden');
  el('#btnLeave').addEventListener('click', ()=> {
    socket.emit('leaveGame', { gameId: joinedGameId });
    joinedGameId = null;
    closeModal();
    loadGames();
  });

  // auto-leave after 5 minutes (safety)
  setTimeout(()=>{
    if(joinedGameId){
      socket.emit('leaveGame', { gameId: joinedGameId });
      joinedGameId = null;
      closeModal();
      loadGames();
    }
  }, 1000 * 60 * 5);
}

// --- Live updates ---
socket.on('players:update', ({ gameId, count })=>{
  // update UI counts for live players
  const elCount = document.querySelector(`.players-count[data-id="${gameId}"]`);
  if(elCount) elCount.textContent = formatPlayers(count) + ' jugando';
  // also update modal if open
  const modalPlayers = document.getElementById('modalPlayers');
  if(modalPlayers && String(gameId) === String(joinedGameId)) modalPlayers.textContent = formatPlayers(count);
});

socket.on('players:increment', ({ gameId, players })=>{
  // update stored players visible in UI (approx)
  const idx = gamesCache.findIndex(g => String(g.id) === String(gameId));
  if(idx !== -1){
    gamesCache[idx].players = players;
    const elCount = document.querySelector(`.players-count[data-id="${gameId}"]`);
    if(elCount) elCount.textContent = formatPlayers(players) + ' jugando';
  }
});

// --- Data loading ---
async function loadGames(){
  try{
    const res = await fetch(`${API}/api/games`);
    const data = await res.json();
    gamesCache = data;
    renderGames(data);
    // update featured
    if(data[0]){
      el('#featuredTitle').textContent = data[0].title;
      el('#featuredPlayers').textContent = formatPlayers(data[0].players) + ' jugando';
    }
  }catch(err){ console.error('load games error', err); }
}

// --- Init ---
attachNavEvents();
refreshAuthUI();
loadGames();
