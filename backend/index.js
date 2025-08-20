const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Estado del juego en memoria (en producción usarías una base de datos)
let gameState = null;

// Archivo para guardar el historial
const HISTORY_FILE = path.join(__dirname, 'game_history.json');

// Función para leer el historial
function readHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error al leer historial:', error);
    return [];
  }
}

// Función para guardar una partida en el historial
function saveGameToHistory(gameData) {
  try {
    const history = readHistory();
    const gameRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      dateFormatted: new Date().toLocaleString('es-ES'),
      players: gameData.players,
      winner: gameData.winner,
      isRealTie: gameData.isRealTie || false,
      totalGameTime: gameData.totalGameTime,
      totalGameTimeFormatted: formatTime(gameData.totalGameTime),
      playersSummary: gameData.playersSummary,
      finalScores: gameData.finalScores,
      finalTimes: gameData.finalTimes
    };
    
    history.unshift(gameRecord); // Agregar al inicio (más recientes primero)
    
    // Mantener solo los últimos 50 juegos
    if (history.length > 50) {
      history.splice(50);
    }
    
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    console.log('🗃️ Partida guardada en historial');
  } catch (error) {
    console.error('Error al guardar historial:', error);
  }
}

// Función para formatear tiempo en formato legible
function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Función para generar número aleatorio entre 1 y 100
function generateSecretNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

// Función para mezclar aleatoriamente los jugadores
function shufflePlayers(player1, player2) {
  return Math.random() < 0.5 ? [player1, player2] : [player2, player1];
}

app.get("/api/mensaje", (req, res) => {
  res.json({ mensaje: "Hola desde el backend con Express 😎" });
});

// Iniciar nueva partida
app.post("/api/game/start", (req, res) => {
  const { player1, player2 } = req.body;
  
  if (!player1 || !player2) {
    return res.status(400).json({ error: "Se requieren ambos nombres de jugadores" });
  }

  // Mezclar jugadores aleatoriamente
  const shuffledPlayers = shufflePlayers(player1, player2);
  
  // Inicializar estado del juego
  gameState = {
    players: shuffledPlayers,
    currentRound: 1,
    activePlayer: 0, // Índice del jugador que adivina (0 o 1)
    secretNumber: generateSecretNumber(),
    attempts: [], // Intentos de la ronda actual
    scores: [0, 0], // Total de intentos por jugador [jugador1, jugador2]
    roundScores: [], // Intentos por ronda para cada jugador
    totalTimes: [0, 0], // Tiempo total por jugador en milisegundos
    roundTimes: [], // Tiempo por ronda para cada jugador
    roundStartTime: Date.now(), // Tiempo de inicio de la ronda actual
    gameStartTime: Date.now(), // Tiempo de inicio del juego
    status: 'playing',
    gameHistory: [] // Historial detallado de intentos por ronda
  };

  console.log("🎮 Nueva partida iniciada:", {
    jugadores: shuffledPlayers,
    numeroSecreto: gameState.secretNumber,
    jugadorActivo: shuffledPlayers[0]
  });

  res.json({
    message: "Partida iniciada",
    gameState: {
      players: gameState.players,
      currentRound: gameState.currentRound,
      activePlayer: gameState.activePlayer,
      activePlayerName: gameState.players[gameState.activePlayer],
      status: gameState.status,
      attempts: gameState.attempts,
      currentScores: gameState.scores
    }
  });
});

// Hacer un intento
app.post("/api/game/guess", (req, res) => {
  const { guess } = req.body;
  
  if (!gameState) {
    return res.status(400).json({ error: "No hay partida activa" });
  }

  if (gameState.status !== 'playing') {
    return res.status(400).json({ error: "La partida no está en curso" });
  }

  const guessNumber = parseInt(guess);
  
  if (isNaN(guessNumber) || guessNumber < 1 || guessNumber > 100) {
    return res.status(400).json({ error: "El número debe estar entre 1 y 100" });
  }

  // Agregar intento
  gameState.attempts.push({
    number: guessNumber,
    player: gameState.players[gameState.activePlayer]
  });

  let result;
  let roundComplete = false;

  // Verificar el intento
  if (guessNumber === gameState.secretNumber) {
    result = "¡Correcto! 🎉";
    roundComplete = true;
  } else if (guessNumber < gameState.secretNumber) {
    result = "El número es mayor 📈";
  } else {
    result = "El número es menor 📉";
  }

  console.log(`🎯 Intento: ${guessNumber} vs ${gameState.secretNumber} - ${result}`);

  // Si adivinó correctamente, terminar ronda
  if (roundComplete) {
    const roundEndTime = Date.now();
    const roundDuration = roundEndTime - gameState.roundStartTime;
    
    // Guardar intentos y tiempo de esta ronda
    gameState.scores[gameState.activePlayer] += gameState.attempts.length;
    gameState.totalTimes[gameState.activePlayer] += roundDuration;
    
    // Guardar historial detallado de la ronda
    const roundData = {
      round: gameState.currentRound,
      player: gameState.players[gameState.activePlayer],
      playerIndex: gameState.activePlayer,
      secretNumber: gameState.secretNumber,
      attempts: [...gameState.attempts],
      attemptsCount: gameState.attempts.length,
      timeMs: roundDuration,
      timeFormatted: formatTime(roundDuration)
    };
    
    gameState.gameHistory.push(roundData);
    
    // Organizar scores por ronda para el resumen final
    if (!gameState.roundScores[gameState.activePlayer]) {
      gameState.roundScores[gameState.activePlayer] = [];
    }
    gameState.roundScores[gameState.activePlayer].push({
      round: gameState.currentRound,
      attempts: gameState.attempts.length,
      time: roundDuration
    });

    // Verificar si el juego terminó (6 rondas completadas)
    if (gameState.currentRound >= 6) {
      gameState.status = 'finished';
      
      // Determinar ganador con criterios: 1) menor intentos, 2) menor tiempo
      let winner;
      if (gameState.scores[0] < gameState.scores[1]) {
        winner = 0;
      } else if (gameState.scores[1] < gameState.scores[0]) {
        winner = 1;
      } else {
        // Empate en intentos, decidir por tiempo
        winner = gameState.totalTimes[0] <= gameState.totalTimes[1] ? 0 : 1;
      }
      
      const isRealTie = gameState.scores[0] === gameState.scores[1] && 
                        gameState.totalTimes[0] === gameState.totalTimes[1];
      
      // Crear resumen detallado final
      const finalResult = {
        status: 'finished',
        winner: isRealTie ? 'Empate' : gameState.players[winner],
        isRealTie: isRealTie,
        gameEndTime: Date.now(),
        totalGameTime: Date.now() - gameState.gameStartTime,
        playersSummary: gameState.players.map((playerName, index) => ({
          name: playerName,
          totalAttempts: gameState.scores[index],
          totalTime: gameState.totalTimes[index],
          totalTimeFormatted: formatTime(gameState.totalTimes[index]),
          averageAttemptsPerRound: (gameState.scores[index] / 3).toFixed(1),
          averageTimePerRound: formatTime(Math.round(gameState.totalTimes[index] / 3)),
          roundsPlayed: gameState.roundScores[index] || []
        })),
        roundByRoundSummary: gameState.gameHistory,
        finalScores: {
          [gameState.players[0]]: gameState.scores[0],
          [gameState.players[1]]: gameState.scores[1]
        },
        finalTimes: {
          [gameState.players[0]]: formatTime(gameState.totalTimes[0]),
          [gameState.players[1]]: formatTime(gameState.totalTimes[1])
        }
      };

      console.log("🏁 Juego terminado:", finalResult);
      
      // Guardar la partida en el historial
      saveGameToHistory(finalResult);
      
      return res.json({
        result,
        roundComplete: true,
        gameComplete: true,
        finalResult
      });
    }

    // Siguiente ronda
    gameState.currentRound++;
    gameState.activePlayer = gameState.activePlayer === 0 ? 1 : 0; // Cambiar jugador
    gameState.secretNumber = generateSecretNumber();
    gameState.attempts = [];
    gameState.roundStartTime = Date.now(); // Reiniciar tiempo para nueva ronda

    console.log(`🔄 Siguiente ronda: ${gameState.currentRound}, Jugador activo: ${gameState.players[gameState.activePlayer]}, Nuevo número: ${gameState.secretNumber}`);
  }

  res.json({
    result,
    roundComplete,
    gameComplete: false,
    gameState: {
      players: gameState.players,
      currentRound: gameState.currentRound,
      activePlayer: gameState.activePlayer,
      activePlayerName: gameState.players[gameState.activePlayer],
      status: gameState.status,
      attempts: gameState.attempts,
      currentScores: gameState.scores
    }
  });
});

// Obtener estado actual del juego
app.get("/api/game/status", (req, res) => {
  if (!gameState) {
    return res.json({ message: "No hay partida activa" });
  }

  const currentTime = Date.now();
  const currentRoundTime = currentTime - gameState.roundStartTime;

  res.json({
    gameState: {
      players: gameState.players,
      currentRound: gameState.currentRound,
      activePlayer: gameState.activePlayer,
      activePlayerName: gameState.players[gameState.activePlayer],
      status: gameState.status,
      attempts: gameState.attempts,
      currentScores: gameState.scores,
      currentTimes: gameState.totalTimes,
      currentRoundTime: formatTime(currentRoundTime),
      gameHistory: gameState.gameHistory
    }
  });
});

// Obtener historial de partidas
app.get("/api/game/history", (req, res) => {
  try {
    const history = readHistory();
    res.json({
      success: true,
      history: history,
      totalGames: history.length
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: "Error al obtener el historial" });
  }
});

// Limpiar historial (opcional para desarrollo)
app.delete("/api/game/history", (req, res) => {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
    res.json({ success: true, message: "Historial limpiado" });
  } catch (error) {
    console.error('Error al limpiar historial:', error);
    res.status(500).json({ error: "Error al limpiar el historial" });
  }
});

// Reiniciar juego
app.post("/api/game/reset", (req, res) => {
  gameState = null;
  res.json({ message: "Juego reiniciado" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

