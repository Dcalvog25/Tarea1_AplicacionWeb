import { useEffect, useState } from "react";
import './App.css';

function App() {
  const [mensaje, setMensaje] = useState("");
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  
  // Estados del juego
  const [gameState, setGameState] = useState(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameResult, setGameResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados del historial
  const [showHistory, setShowHistory] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/mensaje")
      .then((res) => res.json())
      .then((data) => setMensaje(data.mensaje))
      .catch((error) => console.log("Backend no disponible"));
  }, []);

  const handlePlayNow = () => {
    setShowPlayerForm(true);
  };

  const handleStartGame = async () => {
    if (player1Name.trim() && player2Name.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/game/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player1: player1Name,
            player2: player2Name,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          console.log("Datos recibidos del servidor:", data);
          console.log("gameState que se va a setear:", data.gameState);
          setGameState(data.gameState);
          setShowPlayerForm(false);
          setGameResult("");
        } else {
          alert(data.error || "Error al iniciar el juego");
        }
      } catch (error) {
        alert("Error de conexión con el servidor");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Por favor, ingresa ambos nombres de jugadores");
    }
  };

  const handleGuess = async () => {
    if (!currentGuess.trim()) return;
    
    const guess = parseInt(currentGuess);
    if (isNaN(guess) || guess < 1 || guess > 100) {
      alert("Por favor, ingresa un número entre 1 y 100");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/game/guess", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ guess }),
      });

      const data = await response.json();
      if (response.ok) {
        setGameResult(data.result);
        setCurrentGuess("");
        
        if (data.gameComplete) {
          // Juego terminado
          setGameState({ ...data.finalResult, status: 'finished' });
        } else {
          // Actualizar estado del juego
          setGameState(data.gameState);
        }
      } else {
        alert(data.error || "Error al procesar el intento");
      }
    } catch (error) {
      alert("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMenu = () => {
    setShowPlayerForm(false);
    setPlayer1Name("");
    setPlayer2Name("");
    setGameState(null);
    setCurrentGuess("");
    setGameResult("");
    setShowHistory(false);
  };

  const handleNewGame = async () => {
    try {
      await fetch("http://localhost:5000/api/game/reset", { method: "POST" });
      setGameState(null);
      setCurrentGuess("");
      setGameResult("");
      setShowPlayerForm(true);
      setShowHistory(false);
    } catch (error) {
      console.log("Error al reiniciar");
    }
  };

  const handleHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/game/history");
      const data = await response.json();
      
      if (response.ok) {
        setGameHistory(data.history || []);
        setShowHistory(true);
      } else {
        alert("Error al cargar el historial");
      }
    } catch (error) {
      alert("Error de conexión al cargar el historial");
    } finally {
      setIsLoading(false);
    }
  };

  // Debug: mostrar estados actuales
  console.log("Estados actuales:", {
    showPlayerForm,
    gameState,
    gameStateStatus: gameState?.status,
    isLoading
  });

  return (
    <div className="app-container">
      <div className="background-animation">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
        <div className="floating-circle circle-4"></div>
      </div>
      
      <div className="content-wrapper">
        <header className="header">
          <h1 className="game-title">
            <span className="title-glow">BATALLA</span>
            <span className="title-accent">DE NÚMEROS</span>
          </h1>
          <p className="subtitle">
            {!gameState && !showPlayerForm && !showHistory && "Bienvenido al juego de batalla de numeros"}
            {showPlayerForm && "Configura tu partida"}
            {showHistory && "Historial de Partidas"}
            {gameState && gameState.status === 'playing' && `Ronda ${gameState.currentRound} - Turno de ${gameState.activePlayerName}`}
            {gameState && gameState.status === 'finished' && "¡Partida Terminada!"}
          </p>
        </header>

        {/* Menú Principal */}
        {!showPlayerForm && !gameState && !showHistory && (
          <div className="main-menu">
            <button 
              className="menu-button play-button"
              onClick={handlePlayNow}
            >
              <span className="button-icon">🎮</span>
              <span className="button-text">JUEGA YA</span>
            </button>
            
            <button 
              className="menu-button history-button"
              onClick={handleHistory}
            >
              <span className="button-icon">📊</span>
              <span className="button-text">HISTORIAL</span>
            </button>
          </div>
        )}

        {/* Formulario de Jugadores */}
        {showPlayerForm && !gameState && (
          <div className="player-form">
            <div className="form-container">
              <h2 className="form-title">Nombres de Jugadores</h2>
              
              <div className="input-group">
                <label className="input-label">Jugador 1</label>
                <input
                  type="text"
                  className="player-input"
                  placeholder="Ingrese su nombre"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  maxLength={20}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Jugador 2</label>
                <input
                  type="text"
                  className="player-input"
                  placeholder="Ingrese su nombre"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  maxLength={20}
                />
              </div>

              <div className="form-buttons">
                <button 
                  className="menu-button back-button"
                  onClick={handleBackToMenu}
                >
                  <span className="button-icon">⬅️</span>
                  <span className="button-text">VOLVER</span>
                </button>

                <button 
                  className="menu-button start-game-button"
                  onClick={handleStartGame}
                  disabled={!player1Name.trim() || !player2Name.trim() || isLoading}
                >
                  <span className="button-icon">🚀</span>
                  <span className="button-text">{isLoading ? "INICIANDO..." : "COMENZAR"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pantalla de Historial */}
        {showHistory && (
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
                  onClick={handleBackToMenu}
                >
                  <span className="button-icon">🏠</span>
                  <span className="button-text">MENÚ PRINCIPAL</span>
                </button>
                
                <button 
                  className="menu-button play-button"
                  onClick={() => {
                    setShowHistory(false);
                    setShowPlayerForm(true);
                  }}
                >
                  <span className="button-icon">🎮</span>
                  <span className="button-text">NUEVA PARTIDA</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interfaz del Juego */}
        {gameState && gameState.status === 'playing' && (
          <div className="game-interface">
            <div className="game-container">
              <div className="game-info">
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
                onClick={handleBackToMenu}
              >
                <span className="button-icon">🏠</span>
                <span className="button-text">VOLVER AL MENÚ</span>
              </button>
            </div>
          </div>
        )}

        {/* Pantalla de Resultados Finales */}
        {gameState && gameState.status === 'finished' && (
          <div className="final-results">
            <div className="results-container">
              <h2 className="results-title">🏆 Resultados Finales</h2>
              
              <div className="winner-announcement">
                {gameState.isRealTie ? (
                  <p className="tie-message">¡Empate Perfecto! 🤝</p>
                ) : gameState.winner === 'Empate' ? (
                  <p className="tie-message">¡Es un empate! 🤝</p>
                ) : (
                  <p className="winner-message">¡Ganador: <strong>{gameState.winner}</strong>! 🎉</p>
                )}
              </div>

              {/* Resumen Completo en un Solo Recuadro */}
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
                  onClick={handleNewGame}
                >
                  <span className="button-icon">🎮</span>
                  <span className="button-text">NUEVA PARTIDA</span>
                </button>

                <button 
                  className="menu-button back-button"
                  onClick={handleBackToMenu}
                >
                  <span className="button-icon">🏠</span>
                  <span className="button-text">MENÚ PRINCIPAL</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pantalla de debug/fallback cuando gameState existe pero no está en 'playing' ni 'finished' */}
        {gameState && gameState.status !== 'playing' && gameState.status !== 'finished' && (
          <div className="debug-screen">
            <div className="form-container">
              <h2 className="form-title">Estado del Juego</h2>
              <p style={{color: '#fff'}}>Estado: {gameState.status}</p>
              <p style={{color: '#fff'}}>Jugadores: {gameState.players?.join(', ') || 'No definidos'}</p>
              <p style={{color: '#fff'}}>Ronda: {gameState.currentRound || 'No definida'}</p>
              <button 
                className="menu-button back-button"
                onClick={handleBackToMenu}
              >
                <span className="button-icon">🏠</span>
                <span className="button-text">VOLVER AL MENÚ</span>
              </button>
            </div>
          </div>
        )}

        {/* Si gameState existe pero está en loading */}
        {isLoading && (
          <div className="loading-screen">
            <div className="form-container">
              <h2 className="form-title">Cargando...</h2>
              <p style={{color: '#fff'}}>Por favor espera</p>
            </div>
          </div>
        )}

        <div className="status-indicator">    
          <div className="connection-status">
            <div className={`status-dot ${mensaje ? 'connected' : 'disconnected'}`}></div>
            <span>{mensaje ? 'Servidor conectado' : 'Modo offline'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
