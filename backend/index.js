const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Estado del juego en memoria (en producción usarías una base de datos)
let gameState = null;

// Función para generar número aleatorio entre 1 y 100
function numerosecreto() {
  return Math.floor(Math.random() * 100) + 1;
}

// Función para mezclar aleatoriamente los jugadores
function mezclarRandomJugadores(player1, player2) {
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
  const jugadoresmezclados = mezclarRandomJugadores(player1, player2);
  
  // Inicializar estado del juego
  gameState = {
    players: jugadoresmezclados,
    currentRound: 1,
    activePlayer: 0, // Índice del jugador que adivina (0 o 1)
    secretNumber: numerosecreto(),
    attempts: [], // Intentos de la ronda actual
    scores: [0, 0], // Total de intentos por jugador [jugador1, jugador2]
    roundScores: [], // Intentos por ronda [[ronda1_j1, ronda1_j2], [ronda2_j1, ronda2_j2], ...]
    status: 'playing',
    gameHistory: [] // Historial de intentos por ronda
  };

  console.log("🎮 Nueva partida iniciada:", {
    jugadores: jugadoresmezclados,
    numeroSecreto: gameState.secretNumber,
    jugadorActivo: jugadoresmezclados[0]
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
    // Guardar intentos de esta ronda
    gameState.scores[gameState.activePlayer] += gameState.attempts.length;
    
    // Guardar historial de la ronda
    gameState.gameHistory.push({
      round: gameState.currentRound,
      player: gameState.players[gameState.activePlayer],
      secretNumber: gameState.secretNumber,
      attempts: [...gameState.attempts],
      attemptsCount: gameState.attempts.length
    });

    // Verificar si el juego terminó (6 rondas completadas)
    if (gameState.currentRound >= 6) {
      gameState.status = 'finished';
      
      // Determinar ganador
      const winner = gameState.scores[0] < gameState.scores[1] ? 0 : 
                    gameState.scores[1] < gameState.scores[0] ? 1 : -1; // -1 = empate
      
      const finalResult = {
        status: 'finished',
        winner: winner === -1 ? 'Empate' : gameState.players[winner],
        finalScores: {
          [gameState.players[0]]: gameState.scores[0],
          [gameState.players[1]]: gameState.scores[1]
        },
        gameHistory: gameState.gameHistory
      };

      console.log("🏁 Juego terminado:", finalResult);
      
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

  res.json({
    gameState: {
      players: gameState.players,
      currentRound: gameState.currentRound,
      activePlayer: gameState.activePlayer,
      activePlayerName: gameState.players[gameState.activePlayer],
      status: gameState.status,
      attempts: gameState.attempts,
      currentScores: gameState.scores,
      gameHistory: gameState.gameHistory
    }
  });
});

// Reiniciar juego
app.post("/api/game/reset", (req, res) => {
  gameState = null;
  res.json({ message: "Juego reiniciado" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

