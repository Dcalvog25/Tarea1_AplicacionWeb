/**
 * Componente para mostrar los resultados finales de la partida
 * PROPÓSITO: Presentar de manera simple y clara quién ganó y las estadísticas básicas
 * RAZÓN: Los jugadores necesitan ver el resultado principal sin sobrecarga visual
 */
function FinalResults({ gameState, onNewGame, onBackToMenu }) {
  return (
    <div className="final-results">
      <div className="simple-container">
        <h2>🏆 Resultado Final</h2>
        
        {/* Anuncio del ganador - Simple y directo */}
        <div className="winner-box">
          {gameState.isRealTie ? (
            <h3>🤝 ¡Empate Perfecto!</h3>
          ) : gameState.winner === 'Empate' ? (
            <h3>🤝 ¡Empate!</h3>
          ) : (
            <h3>🎉 Ganador: {gameState.winner}</h3>
          )}
        </div>

        {/* Estadísticas simples en tabla */}
        <div className="simple-stats">
          <table>
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Intentos</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {gameState.playersSummary && gameState.playersSummary.map((player, index) => (
                <tr key={index} className={gameState.winner === player.name ? 'winner-row' : ''}>
                  <td>{player.name} {gameState.winner === player.name ? '👑' : ''}</td>
                  <td>{player.totalAttempts}</td>
                  <td>{player.totalTimeFormatted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botones simples */}
        <div className="simple-buttons">
          <button onClick={onNewGame}>🎮 Nueva Partida</button>
          <button onClick={onBackToMenu}>🏠 Menú Principal</button>
        </div>
      </div>
    </div>
  );
}

export default FinalResults;
