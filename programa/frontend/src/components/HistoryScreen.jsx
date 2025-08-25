/**
 * Componente para mostrar el historial de partidas
 * PROPÓSITO: Mostrar de manera simple el historial de juegos anteriores
 * RAZÓN: Los jugadores quieren revisar sus partidas pasadas sin complicaciones visuales
 */
function HistoryScreen({ gameHistory, onBackToMenu, onNewGame }) {
  return (
    <div className="history-screen">
      <div className="simple-container">
        <h2>📊 Historial</h2>
        
        {gameHistory.length === 0 ? (
          <div className="no-history">
            <p>No hay partidas registradas.</p>
            <p>¡Juega tu primera partida!</p>
          </div>
        ) : (
          <div className="simple-history">
            <p>Total de partidas: <strong>{gameHistory.length}</strong></p>
            
            {/* Lista simple de partidas */}
            <div className="history-list">
              {gameHistory.map((game) => (
                <div key={game.id} className="history-item">
                  <div className="game-info">
                    <span className="game-date">{game.dateFormatted}</span>
                    <span className="game-duration">{game.totalGameTimeFormatted}</span>
                  </div>
                  
                  <div className="game-result">
                    {game.isRealTie ? (
                      <span>🤝 Empate Perfecto</span>
                    ) : game.winner === 'Empate' ? (
                      <span>🤝 Empate</span>
                    ) : (
                      <span>🏆 {game.winner}</span>
                    )}
                  </div>
                  
                  {/* Tabla simple de jugadores */}
                  <table className="players-table">
                    <thead>
                      <tr>
                        <th>Jugador</th>
                        <th>Intentos</th>
                        <th>Tiempo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {game.playersSummary && game.playersSummary.map((player, index) => (
                        <tr key={index} className={game.winner === player.name ? 'winner-row' : ''}>
                          <td>{player.name} {game.winner === player.name ? '👑' : ''}</td>
                          <td>{player.totalAttempts}</td>
                          <td>{player.totalTimeFormatted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Botones simples */}
        <div className="simple-buttons">
          <button onClick={onBackToMenu}>🏠 Menú Principal</button>
          <button onClick={onNewGame}>🎮 Nueva Partida</button>
        </div>
      </div>
    </div>
  );
}

export default HistoryScreen;
