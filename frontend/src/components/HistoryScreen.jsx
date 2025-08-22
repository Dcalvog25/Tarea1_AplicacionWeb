function HistoryScreen({ gameHistory, onBackToMenu, onNewGame }) {
  return (
    <div className="history-screen">
      <div className="history-container">
        <h2 className="history-title">📊 Historial de Partidas</h2>
        
        {gameHistory.length === 0 ? (
          <div className="no-history">
            <p>No hay partidas registradas aún.</p>
            <p>¡Juega tu primera partida para ver el historial!</p>
          </div>
        ) : (
          <div className="history-list">
            <div className="history-stats">
              <p>Total de partidas jugadas: <strong>{gameHistory.length}</strong></p>
            </div>
            
            {gameHistory.map((game) => (
              <div key={game.id} className="history-item">
                <div className="history-header">
                  <div className="game-date">
                    <span className="date-label">Fecha:</span>
                    <span className="date-value">{game.dateFormatted}</span>
                  </div>
                  <div className="game-duration">
                    <span className="duration-label">Duración total:</span>
                    <span className="duration-value">{game.totalGameTimeFormatted}</span>
                  </div>
                </div>
                
                <div className="game-result">
                  {game.isRealTie ? (
                    <div className="result-tie">🤝 Empate Perfecto</div>
                  ) : game.winner === 'Empate' ? (
                    <div className="result-tie">🤝 Empate</div>
                  ) : (
                    <div className="result-winner">🏆 Ganador: <strong>{game.winner}</strong></div>
                  )}
                </div>
                
                <div className="players-summary-hist">
                  {game.playersSummary && game.playersSummary.map((player, index) => (
                    <div key={index} className={`player-hist-card ${game.winner === player.name ? 'winner-hist' : ''}`}>
                      <div className="player-hist-name">
                        {player.name} {game.winner === player.name ? '👑' : ''}
                      </div>
                      <div className="player-hist-stats">
                        <div className="hist-stat">
                          <span className="hist-stat-label">Intentos:</span>
                          <span className="hist-stat-value">{player.totalAttempts}</span>
                        </div>
                        <div className="hist-stat">
                          <span className="hist-stat-label">Tiempo:</span>
                          <span className="hist-stat-value">{player.totalTimeFormatted}</span>
                        </div>
                      </div>
                      <div className="rounds-hist">
                        <span className="rounds-hist-label">Por ronda:</span>
                        <div className="rounds-hist-list">
                          {player.roundsPlayed && player.roundsPlayed.map((round, roundIndex) => (
                            <span key={roundIndex} className="round-hist-item">
                              R{round.round}: {round.attempts}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="history-buttons">
          <button 
            className="menu-button back-button"
            onClick={onBackToMenu}
          >
            <span className="button-icon">🏠</span>
            <span className="button-text">MENÚ PRINCIPAL</span>
          </button>
          
          <button 
            className="menu-button play-button"
            onClick={onNewGame}
          >
            <span className="button-icon">🎮</span>
            <span className="button-text">NUEVA PARTIDA</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HistoryScreen;
