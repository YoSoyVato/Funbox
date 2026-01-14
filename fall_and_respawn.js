const deathY = -5; // altura de muerte real
function checkFall() {
  // gravedad
  velY += gravity;
  player.position.y += velY;

  // base del jugador
  const playerBaseY = player.position.y - 0.6; // mitad del cuerpo

  let onGround = false;

  // suelo
  if(playerBaseY <= 0){
    player.position.y = 0.6;
    velY = 0;
    onGround = true;
  }

  // bloques
  blockMeshes.forEach(b => {
    const top = b.position.y + 0.5;
    if(player.position.x > b.position.x - 0.5 &&
       player.position.x < b.position.x + 0.5 &&
       player.position.z > b.position.z - 0.5 &&
       player.position.z < b.position.z + 0.5 &&
       playerBaseY <= top){
      player.position.y = top + 0.6;
      velY = 0;
      onGround = true;
    }
  });

  // caída
  if(playerBaseY < deathY){
    player.position.copy(spawn);
    velY = 0;
  }

  return onGround;
}
