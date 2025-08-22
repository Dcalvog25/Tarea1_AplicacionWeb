/**
 * Componente para mostrar los resultados finales de la partida
 * Presentar de manera clara y atractiva quién ganó y las estadísticas completas
 * Los jugadores necesitan ver un resumen detallado de su desempeño al final del juego
 */
function FinalResults({ gameState, onNewGame, onBackToMenu }) {
  return (
    <div className="final-results">
      <div className="results-container">
        <h2 className="results-title">🏆 Resultados Finales</h2>
        
        {/* 
          ANUNCIO DEL GANADOR
          Destacar claramente el resultado principal del juego
          Es lo primero que los jugadores quieren saber al terminar
        */}
        <div className="winner-announcement">
          {gameState.isRealTie ? (
            <p className="tie-message">¡Empate Perfecto! 🤝</p>
          ) : gameState.winner === 'Empate' ? (
            <p className="tie-message">¡Es un empate! 🤝</p>
          ) : (
            <p className="winner-message">¡Ganador: <strong>{gameState.winner}</strong>! 🎉</p>
          )}
        </div>

        {/* 
          RESUMEN ESTADÍSTICO COMPLETO
          Mostrar el rendimiento detallado de cada jugador
          Permite analizar el desempeño y entender por qué ganó quien ganó
        */}
        <div className="game-summary">
          <h3>📊 Resumen de la Partida</h3>
          
          {gameState.playersSummary && gameState.playersSummary.map((player, index) => (
            <div key={index} className={`player-summary ${gameState.winner === player.name ? 'winner-summary' : ''}`}>
              <div className="player-name-section">
                <h4>{player.name} {gameState.winner === player.name ? '👑' : ''}</h4>
              </div>
              
              <div className="player-details">
                <div className="summary-stat">
                  <span className="stat-label">Total de intentos:</span>
                  <span className="stat-value">{player.totalAttempts}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Tiempo total:</span>
                  <span className="stat-value">{player.totalTimeFormatted}</span>
                </div>
              </div>

              {/* Intentos por Ronda */}
              <div className="rounds-breakdown">
                <span className="breakdown-title">Intentos por ronda:</span>
                <div className="rounds-list">
                  {player.roundsPlayed && player.roundsPlayed.map((round, roundIndex) => (
                    <span key={roundIndex} className="round-attempt">
                      R{round.round}: {round.attempts}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-buttons">
          <button 
            className="menu-button start-game-button"
            onClick={onNewGame}
          >
            <span className="button-icon">🎮</span>
            <span className="button-text">NUEVA PARTIDA</span>
          </button>

          <button 
            className="menu-button back-button"
            onClick={onBackToMenu}
          >
            <span className="button-icon">🏠</span>
            <span className="button-text">MENÚ PRINCIPAL</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FinalResults;
