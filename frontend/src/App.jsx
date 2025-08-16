import { useEffect, useState } from "react";
import './App.css';

function App() {
  const [mensaje, setMensaje] = useState("");
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/mensaje")
      .then((res) => res.json())
      .then((data) => setMensaje(data.mensaje))
      .catch((error) => console.log("Backend no disponible"));
  }, []);

  const handlePlayNow = () => {
    setShowPlayerForm(true);
  };

  const handleStartGame = () => {
    if (player1Name.trim() && player2Name.trim()) {
      console.log("¡Iniciando juego!", { player1: player1Name, player2: player2Name });
      // Aquí puedes agregar la lógica para empezar el juego con los nombres
    } else {
      alert("Por favor, ingresa ambos nombres de jugadores");
    }
  };

  const handleBackToMenu = () => {
    setShowPlayerForm(false);
    setPlayer1Name("");
    setPlayer2Name("");
  };

  const handleHistory = () => {
    console.log("Ver historial");
    // Aquí puedes agregar la lógica para ver el historial
  };

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
            <span className="title-glow">GAME</span>
            <span className="title-accent">ZONE</span>
          </h1>
          <p className="subtitle">
            {showPlayerForm ? "Configura tu partida" : "Bienvenido a la experiencia de juego definitiva"}
          </p>
        </header>

        {!showPlayerForm ? (
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
        ) : (
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
                  disabled={!player1Name.trim() || !player2Name.trim()}
                >
                  <span className="button-icon">🚀</span>
                  <span className="button-text">COMENZAR</span>
                </button>
              </div>
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
