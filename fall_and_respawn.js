// ======================
// CAÍDA Y REAPARICIÓN
// ======================
const deathY = -10; // altura donde muere
function checkFall() {
  // Aplicar gravedad
  velY += gravity;
  player.position.y += velY;

  // Colisión con suelo base
  if(player.position.y <= 0.6){
    player.position.y = 0.6;
    velY = 0;
  }

  // Colisión con bloques
  blockMeshes.forEach(b=>{
    if(Math.abs(player.position.x - b.position.x) < 0.5 + 0.25 &&
       Math.abs(player.position.z - b.position.z) < 0.5 + 0.25 &&
       player.position.y <= b.position.y + 0.6){
      player.position.y = b.position.y + 0.6;
      velY = 0;
    }
  });

  // Caída por debajo de deathY
  if(player.position.y < deathY){
    player.position.copy(spawn);
    velY = 0;
  }
}
