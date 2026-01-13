// app.js - Demo frontend logic
const sampleGames = [
  { id:1, title:"Isla Aventura", players:1240, thumb:"https://via.placeholder.com/420x220.png?text=Isla+Aventura", desc:"Explora islas, construye bases y vence desafíos con amigos." },
  { id:2, title:"Carrera Extrema", players:842, thumb:"https://via.placeholder.com/420x220.png?text=Carrera+Extrema", desc:"Carreras a toda velocidad con pistas locas y power-ups." },
  { id:3, title:"Escape Lab", players:432, thumb:"https://via.placeholder.com/420x220.png?text=Escape+Lab", desc:"Rompecabezas y cooperación para escapar de laboratorios misteriosos." },
  { id:4, title:"Batalla Royale Mini", players:5320, thumb:"https://via.placeholder.com/420x220.png?text=Battle+Mini", desc:"Entra en arenas rápidas, consigue loot y sé el último en pie." },
  { id:5, title:"Sim de Restaurante", players:298, thumb:"https://via.placeholder.com/420x220.png?text=Restaurante+Sim", desc:"Gestiona tu restaurante y sirve pedidos a velocidad." }
];

function el(selector){ return document.querySelector(selector) }
function renderGames(games){
  const grid = el('#gamesGrid');
  grid.innerHTML = '';
  games.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `
      <img class="game-thumb" src="${g.thumb}" alt="${g.title}">
      <div class="game-body">
        <h4 class="game-title">${g.title}</h4>
        <div class="game-meta">
          <span>${g.players.toLocaleString()} jugando</span>
          <button class="play-small" data-id="${g.id}">Jugar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Search
el('#searchInput').addEventListener('input', e=>{
  const q = e.target.value.toLowerCase().trim();
  const filtered = sampleGames.filter(g => g.title.toLowerCase().includes(q));
  renderGames(filtered);
});

// Delegation for play buttons and card clicks
el('#gamesGrid').addEventListener('click', e=>{
  const playBtn = e.target.closest('.play-small');
  if(playBtn){
    const id = Number(playBtn.dataset.id);
    playGame(id);
  }
  const card = e.target.closest('.game-card');
  if(card && !e.target.classList.contains('play-small')){
    // open modal details
    const idx = Array.from(document.querySelectorAll('.game-card')).indexOf(card);
    openModal(sampleGames[idx]);
  }
});

function playGame(id){
  const game = sampleGames.find(g=>g.id===id);
  if(!game) return alert('Juego no encontrado');
  // Simula inicio de juego
  alert('Iniciando ' + game.title + ' — simulación demo');
}

// Modal
function openModal(game){
  const modal = el('#modal');
  const body = el('#modalBody');
  body.innerHTML = `
    <div style="display:flex; gap:16px; align-items:flex-start;">
      <img src="${game.thumb}" alt="${game.title}" style="width:300px; border-radius:8px; object-fit:cover;">
      <div>
        <h2 style="margin-top:0">${game.title}</h2>
        <p style="color:var(--muted)">${game.desc}</p>
        <p style="color:var(--muted)">${game.players.toLocaleString()} jugando</p>
        <div style="margin-top:12px">
          <button class="btn primary" id="modalPlay">Jugar</button>
          <button class="btn ghost" id="modalCloseBtn">Cerrar</button>
        </div>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');

  // Handlers
  el('#modalClose')?.addEventListener('click', closeModal);
  el('#modalCloseBtn')?.addEventListener('click', closeModal);
  el('#modalPlay')?.addEventListener('click', ()=>{ playGame(game.id); closeModal(); });
}
function closeModal(){ el('#modal').classList.add('hidden'); }

// Featured button
el('#featuredPlay').addEventListener('click', ()=> playGame(1));
el('#featuredMore').addEventListener('click', ()=> openModal(sampleGames[0]));

// Initial render
renderGames(sampleGames);
