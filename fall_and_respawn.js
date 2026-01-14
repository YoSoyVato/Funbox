// ======================
// Archivo: fall_and_respawn.js
// Función: Reaparecer jugador al caer del mapa
// ======================

/**
 * Configuración:
 * - player: objeto THREE.Group o Mesh del jugador
 * - spawnPoint: THREE.Vector3 donde reaparece
 * - deathY: altura mínima para "morir" y reaparecer
 */
export function setupFallAndRespawn(player, spawnPoint, deathY = -10) {
  let velY = 0;
  const gravity = -0.03;

  function updateFall() {
    // Aplicar gravedad
    velY += gravity;
    player.position.y += velY;

    // Revisar caída
    if (player.position.y < deathY) {
      player.position.copy(spawnPoint);
      velY = 0;
    }

    // Llamar esto en tu loop principal
    requestAnimationFrame(updateFall);
  }

  updateFall();

  // Retornar funciones por si quieres controlar manualmente
  return {
    getVelocity: () => velY,
    setVelocity: (v) => { velY = v; }
  };
}
