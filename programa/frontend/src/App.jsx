import { useEffect, useState } from "react";
import './App.css';
import MainMenu from './components/MainMenu';
import PlayerForm from './components/PlayerForm';
import GameInterface from './components/GameInterface';
import FinalResults from './components/FinalResults';
import HistoryScreen from './components/HistoryScreen';

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

  /**
   * Verificar conexión con el backend al cargar la aplicación
   * Confirmar que el servidor está disponible y mostrar estado de conexión
   * Los usuarios necesitan saber si pueden jugar o si hay problemas de conectividad
   */
  useEffect(() => {
    fetch("http://localhost:5000/api/mensaje")
      .then((res) => res.json())
      .then((data) => setMensaje(data.mensaje))
      .catch((error) => console.log("Backend no disponible"));
  }, []);

  const handlePlayNow = () => {
    setShowPlayerForm(true);
  };

  /**
   * Inicia una nueva partida enviando los nombres al backend
   * Comunicar al servidor los jugadores y recibir el estado inicial del juego
   * El backend debe conocer quiénes juegan para gestionar turnos y estadísticas
   */
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

  /**
   * Procesa cada intento de adivinanza del jugador activo
   * Enviar el número al backend y actualizar el estado según la respuesta
   * Cada intento debe ser evaluado por el servidor para mantener la lógica del juego centralizada
   */
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
          // Juego terminado - mostrar resultados finales
          setGameState({ ...data.finalResult, status: 'finished' });
        } else {
          // Continuar con la siguiente jugada
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

  /**
   * Regresa al menú principal y limpia todos los estados
   * Permitir navegación fluida entre pantallas sin residuos de estado
   * Evita conflictos entre diferentes secciones de la aplicación
   */
  const handleBackToMenu = () => {
    setShowPlayerForm(false);
    setPlayer1Name("");
    setPlayer2Name("");
    setGameState(null);
    setCurrentGuess("");
    setGameResult("");
    setShowHistory(false);
  };

  /**
   * Reinicia el juego y prepara una nueva partida
   * Permitir jugar múltiples partidas sin recargar la aplicación
   * Mejora la experiencia del usuario al mantener fluidez en el juego
   */
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

  /**
   * Carga y muestra el historial de partidas anteriores
   * Permitir a los jugadores revisar su desempeño histórico
   * Los jugadores quieren ver estadísticas y comparar sus mejoras
   */
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
          <MainMenu 
            onPlayNow={handlePlayNow}
            onShowHistory={handleHistory}
          />
        )}

        {/* Formulario de Jugadores */}
        {showPlayerForm && !gameState && (
          <PlayerForm 
            player1Name={player1Name}
            player2Name={player2Name}
            setPlayer1Name={setPlayer1Name}
            setPlayer2Name={setPlayer2Name}
            onStartGame={handleStartGame}
            onBackToMenu={handleBackToMenu}
            isLoading={isLoading}
          />
        )}

        {/* Pantalla de Historial */}
        {showHistory && (
          <HistoryScreen 
            gameHistory={gameHistory}
            onBackToMenu={handleBackToMenu}
            onNewGame={() => {
              setShowHistory(false);
              setShowPlayerForm(true);
            }}
          />
        )}

        {/* Interfaz del Juego */}
        {gameState && gameState.status === 'playing' && (
          <GameInterface 
            gameState={gameState}
            currentGuess={currentGuess}
            setCurrentGuess={setCurrentGuess}
            onGuess={handleGuess}
            onBackToMenu={handleBackToMenu}
            gameResult={gameResult}
            isLoading={isLoading}
          />
        )}

        {/* Pantalla de Resultados Finales */}
        {gameState && gameState.status === 'finished' && (
          <FinalResults 
            gameState={gameState}
            onNewGame={handleNewGame}
            onBackToMenu={handleBackToMenu}
          />
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
