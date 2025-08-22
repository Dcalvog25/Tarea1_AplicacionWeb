function PlayerForm({ 
  player1Name, 
  player2Name, 
  setPlayer1Name, 
  setPlayer2Name, 
  onBackToMenu, 
  onStartGame, 
  isLoading 
}) {
  const handleStartGame = () => {
    if (player1Name.trim() && player2Name.trim()) {
      onStartGame();
    } else {
      alert("Por favor, ingresa ambos nombres de jugadores");
    }
  };

  return (
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
            onClick={onBackToMenu}
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
  );
}

export default PlayerForm;
