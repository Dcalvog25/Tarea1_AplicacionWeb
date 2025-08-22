/**
 * Componente principal de la interfaz durante el juego activo
 * Mostrar el estado actual del juego y permitir a los jugadores hacer intentos
 * Centraliza toda la interacción durante las rondas de juego
 */
function GameInterface({ 
  gameState, 
  currentGuess, 
  setCurrentGuess, 
  onBackToMenu, 
  onGuess, 
  gameResult, 
  isLoading 
}) {
  /**
   * Procesa el intento del jugador actual
   * Validar y enviar el número ingresado al componente padre
   * Mantiene la lógica de validación cerca de la interfaz de entrada
   */
  const handleGuess = () => {
    onGuess();
  };

  return (
    <div className="game-interface">
      <div className="game-container">
        <div className="game-info">
          {/* 
            PANEL DE INFORMACIÓN DE JUGADORES
            Mostrar el estado actual de cada jugador y quién tiene el turno
            Los jugadores necesitan ver claramente sus estadísticas y turno activo
          */}
          <div className="players-info">
            <div className={`player-card ${gameState.activePlayer === 0 ? 'active' : ''}`}>
              <span className="player-name">{gameState.players[0]}</span>
              <span className="player-score">{(gameState.currentScores && gameState.currentScores[0]) || 0} intentos</span>
            </div>
            <div className={`player-card ${gameState.activePlayer === 1 ? 'active' : ''}`}>
              <span className="player-name">{gameState.players[1]}</span>
              <span className="player-score">{(gameState.currentScores && gameState.currentScores[1]) || 0} intentos</span>
            </div>
          </div>
          
          {/* 
            INDICADOR DE PROGRESO DE RONDA
            Mostrar en qué ronda están del total de 6
            Los jugadores necesitan saber cuánto falta para terminar el juego
          */}
          <div className="round-info">
            <span>Ronda {gameState.currentRound} de 6</span>
          </div>
        </div>

        <div className="guess-section">
          <h3 className="guess-title">Adivina el número (1-100)</h3>
          <p className="current-player">Turno de: <strong>{gameState.activePlayerName}</strong></p>
          
          <div className="guess-input-group">
            <input
              type="number"
              className="guess-input"
              placeholder="Ingresa tu número"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value)}
              min="1"
              max="100"
              disabled={isLoading}
            />
            <button 
              className="guess-button"
              onClick={handleGuess}
              disabled={isLoading || !currentGuess.trim()}
            >
              {isLoading ? "..." : "ADIVINAR"}
            </button>
          </div>

          {gameResult && (
            <div className="game-result">
              <p>{gameResult}</p>
            </div>
          )}
        </div>

        <div className="attempts-section">
          <h4>Intentos de esta ronda:</h4>
          <div className="attempts-list">
            {gameState.attempts && gameState.attempts.map((attempt, index) => (
              <span key={index} className="attempt-item">
                {attempt.number}
              </span>
            ))}
          </div>
        </div>

        <button 
          className="menu-button back-button"
          onClick={onBackToMenu}
        >
          <span className="button-icon">🏠</span>
          <span className="button-text">VOLVER AL MENÚ</span>
        </button>
      </div>
    </div>
  );
}

export default GameInterface;
