import { useState, useEffect } from 'react';

/**
 * Componente principal de la interfaz durante el juego activo
 * PROPÓSITO: Mostrar el estado actual del juego y permitir a los jugadores hacer intentos
 * RAZÓN: Centraliza toda la interacción durante las rondas de juego
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
  // Estado para el temporizador de la ronda actual
  const [currentTimer, setCurrentTimer] = useState(0);

  /**
   * Temporizador en tiempo real para la ronda actual
   * PROPÓSITO: Mostrar al jugador cuánto tiempo lleva en su turno actual
   * RAZÓN: Los jugadores quieren saber el tiempo que están tomando para tomar decisiones
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Reiniciar temporizador cuando cambia de ronda o jugador
  useEffect(() => {
    setCurrentTimer(0);
  }, [gameState.currentRound, gameState.activePlayer]);

  /**
   * Formatea segundos a formato MM:SS
   * PROPÓSITO: Mostrar el tiempo de forma legible
   */
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Procesa el intento del jugador actual
   * PROPÓSITO: Validar y enviar el número ingresado al componente padre
   * RAZÓN: Mantiene la lógica de validación cerca de la interfaz de entrada
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
            INDICADOR DE PROGRESO DE RONDA Y TEMPORIZADOR
            PROPÓSITO: Mostrar en qué ronda están y el tiempo transcurrido del turno actual
            RAZÓN: Los jugadores necesitan saber cuánto falta para terminar y cuánto tiempo llevan
          */}
          <div className="round-info">
            <div className="round-progress">
              <span>Ronda {gameState.currentRound} de 6</span>
            </div>
            <div className="current-timer">
              <span>⏱️ Tiempo del turno: {formatTimer(currentTimer)}</span>
            </div>
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
