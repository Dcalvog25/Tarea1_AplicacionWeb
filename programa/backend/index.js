// Servidor básico para el juego de números
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const puerto = 5000;

// Configuración básica
app.use(cors());
app.use(express.json());

// Variables para el juego actual
let juegoActual = null;

/**
 * Genera un número aleatorio entre 1 y 100
 * Crear el número objetivo que los jugadores deben adivinar en cada ronda
 * Cada ronda necesita un nuevo desafío aleatorio
 */
function crearNumero() {
  return Math.floor(Math.random() * 100) + 1;
}

/**
 * Convierte milisegundos a formato legible (minutos y segundos)
 * Mostrar el tiempo transcurrido de forma comprensible para el usuario
 * Los usuarios entienden mejor "2m 30s" que "150000ms" al ver sus estadísticas
 */
function formatearTiempo(ms) {
  const seg = Math.floor(ms / 1000);
  const min = Math.floor(seg / 60);
  const segSobrantes = seg % 60;
  
  if (min > 0) {
    return min + "m " + segSobrantes + "s";
  }
  return seg + "s";
}

/**
 * Lee el historial de partidas desde el archivo JSON
 * Recuperar las partidas anteriores para mostrar estadísticas históricas
 * Los jugadores quieren ver su progreso y comparar partidas anteriores
 */
function obtenerHistorial() {
  try {
    if (fs.existsSync("game_history.json")) {
      const archivo = fs.readFileSync("game_history.json", "utf8");
      return JSON.parse(archivo);
    }
    return [];
  } catch (error) {
    console.log("Error leyendo historial:", error);
    return [];
  }
}

/**
 * Guarda una partida completada en el historial persistente
 * Mantener un registro permanente de todas las partidas jugadas
 * Permite análisis posterior, estadísticas y seguimiento del rendimiento de los jugadores
 */
function guardarEnHistorial(datos) {
  try {
    const historial = obtenerHistorial();
    const ahora = new Date();
    
    const partidaNueva = {
      id: Date.now(),
      date: ahora.toISOString(),
      dateFormatted: ahora.toLocaleString("es-ES"),
      players: datos.nombresJugadores,
      winner: datos.quienGano,
      isRealTie: datos.esEmpateTotal,
      totalGameTime: datos.tiempoCompleto,
      totalGameTimeFormatted: formatearTiempo(datos.tiempoCompleto),
      playersSummary: datos.resumen
    };
    
    historial.unshift(partidaNueva);
    
    // Solo guardar últimas 25 partidas
    if (historial.length > 25) {
      historial.splice(25);
    }
    
    fs.writeFileSync("game_history.json", JSON.stringify(historial, null, 2));
    console.log("✅ Partida guardada");
  } catch (error) {
    console.log("❌ Error guardando:", error);
  }
}

// Ruta de prueba
app.get("/api/mensaje", (req, res) => {
  res.json({ mensaje: "Hola desde el backend con Express 😎" });
});

/**
 * Inicia una nueva partida entre dos jugadores
 * Configurar el estado inicial del juego con jugadores y primer número
 * Necesitamos inicializar todas las variables del juego y determinar quién comienza
 */
app.post("/api/game/start", (req, res) => {
  const { player1, player2 } = req.body;
  
  // Validar que lleguen los nombres
  if (!player1 || !player2) {
    return res.status(400).json({ error: "Necesito los dos nombres" });
  }

  // Quien empieza (aleatorio) - RAZÓN: Equidad en el juego, nadie tiene ventaja
  const primerJugador = Math.random() < 0.5 ? 0 : 1;
  const nombres = [player1, player2];
  
  // Crear el juego nuevo
  juegoActual = {
    nombres: nombres,
    ronda: 1,
    turno: primerJugador,
    numero: crearNumero(),
    intentosDeLaRonda: [],
    totalIntentos: [0, 0],
    totalTiempo: [0, 0],
    empeceLaRonda: Date.now(),
    empeceLaPartida: Date.now(),
    todasLasRondas: []
  };

  console.log("🎮 Partida nueva:");
  console.log("👥 Jugadores:", nombres);
  console.log("🚀 Empieza:", nombres[primerJugador]);
  console.log("🎯 Número:", juegoActual.numero);

  // Mandar estado inicial
  const estadoInicial = {
    status: "playing",
    players: juegoActual.nombres,
    currentRound: juegoActual.ronda,
    activePlayer: juegoActual.turno,
    activePlayerName: nombres[primerJugador],
    attempts: [],
    currentScores: [0, 0]
  };

  res.json({ gameState: estadoInicial });
});

/**
 * Procesa cada intento de adivinanza de los jugadores
 * Evaluar si el número es correcto y gestionar el flujo del juego
 * Es el corazón del juego - determina pistas, cambios de turno y finalización de rondas
 */
app.post("/api/game/guess", (req, res) => {
  const { guess } = req.body;
  
  // Validar que hay juego
  if (!juegoActual) {
    return res.status(400).json({ error: "No hay juego iniciado" });
  }

  const miIntento = parseInt(guess);
  
  // Validar número
  if (isNaN(miIntento) || miIntento < 1 || miIntento > 100) {s
    return res.status(400).json({ error: "Número debe ser entre 1 y 100" });
  }

  // Agregar intento al registro de la ronda actual
  juegoActual.intentosDeLaRonda.push({
    number: miIntento,
    player: juegoActual.nombres[juegoActual.turno]
  });

  let respuesta;
  let rondaCompleta = false;

  // Evaluar el intento y proporcionar retroalimentación
  if (miIntento === juegoActual.numero) {
    respuesta = "¡Correcto! 🎉";
    rondaCompleta = true;
  } else if (miIntento < juegoActual.numero) {
    respuesta = "El número es mayor 📈";
  } else {
    respuesta = "El número es menor 📉";
  }

  console.log(`🎯 ${miIntento} vs ${juegoActual.numero} → ${respuesta}`);

  // Procesar finalización de ronda y cálculo de estadísticas
  if (rondaCompleta) {
    const cuantoTardo = Date.now() - juegoActual.empeceLaRonda;

    // Acumular estadísticas del jugador actual
    juegoActual.totalIntentos[juegoActual.turno] += juegoActual.intentosDeLaRonda.length;
    juegoActual.totalTiempo[juegoActual.turno] += cuantoTardo;
    
    // Guardar información detallada de esta ronda para el historial
    const infoRonda = {
      ronda: juegoActual.ronda,
      jugador: juegoActual.nombres[juegoActual.turno],
      indice: juegoActual.turno,
      intentos: juegoActual.intentosDeLaRonda.length,
      tiempo: cuantoTardo
    };
    
    juegoActual.todasLasRondas.push(infoRonda);
    
    // Limpiar intentos de la ronda
    juegoActual.intentosDeLaRonda = [];
    
    // Verificar si el juego completo ha terminado (6 rondas)
    if (juegoActual.ronda >= 6) {
      // ALGORITMO DE DETERMINACIÓN DE GANADOR
      // Evaluar quién ganó basado en criterios justos y objetivos
      // Necesitamos reglas claras de desempate para determinar el ganador
      let ganador;
      let empateCompleto = false;
      
      // Primero comparar por número total de intentos (menos intentos = mejor)
      if (juegoActual.totalIntentos[0] < juegoActual.totalIntentos[1]) {
        ganador = juegoActual.nombres[0];
      } else if (juegoActual.totalIntentos[1] < juegoActual.totalIntentos[0]) {
        ganador = juegoActual.nombres[1];
      } else {
        // En caso de empate en intentos, desempatar por tiempo (menos tiempo = mejor)
        if (juegoActual.totalTiempo[0] < juegoActual.totalTiempo[1]) {
          ganador = juegoActual.nombres[0];
        } else if (juegoActual.totalTiempo[1] < juegoActual.totalTiempo[0]) {
          ganador = juegoActual.nombres[1];
        } else {
          ganador = "Empate";
          empateCompleto = true;
        }
      }
      
      // Crear resumen de cada jugador
      const resumenFinal = [];
      for (let i = 0; i < 2; i++) {
        const misRondas = juegoActual.todasLasRondas
          .filter(r => r.indice === i)
          .map(r => ({ round: r.ronda, attempts: r.intentos }));
        
        resumenFinal.push({
          name: juegoActual.nombres[i],
          totalAttempts: juegoActual.totalIntentos[i],
          totalTimeFormatted: formatearTiempo(juegoActual.totalTiempo[i]),
          roundsPlayed: misRondas
        });
      }
      
      // Guardar en archivo
      const datosParaArchivo = {
        nombresJugadores: juegoActual.nombres,
        quienGano: ganador,
        esEmpateTotal: empateCompleto,
        tiempoCompleto: Date.now() - juegoActual.empeceLaPartida,
        resumen: resumenFinal
      };
      
      guardarEnHistorial(datosParaArchivo);
      
      // Resultado final
      const resultadoCompleto = {
        status: "finished",
        players: juegoActual.nombres,
        winner: ganador,
        isRealTie: empateCompleto,
        playersSummary: resumenFinal,
        finalScores: juegoActual.totalIntentos,
        totalGameTime: Date.now() - juegoActual.empeceLaPartida
      };
      
      juegoActual = null; // Borrar juego
      
      return res.json({
        result: respuesta,
        gameComplete: true,
        finalResult: resultadoCompleto
      });
    } else {
      // Siguiente ronda
      juegoActual.ronda++;
      juegoActual.turno = 1 - juegoActual.turno; // Cambiar turno
      juegoActual.numero = crearNumero();
      juegoActual.empeceLaRonda = Date.now();

      console.log(`🔄 Ronda ${juegoActual.ronda}`);
      console.log(`👤 Turno: ${juegoActual.nombres[juegoActual.turno]}`);
      console.log(`🎯 Nuevo número: ${juegoActual.numero}`);
    }
  }

  // Respuesta normal
  const estadoActualizado = {
    status: "playing",
    players: juegoActual.nombres,
    currentRound: juegoActual.ronda,
    activePlayer: juegoActual.turno,
    activePlayerName: juegoActual.nombres[juegoActual.turno],
    attempts: juegoActual.intentosDeLaRonda,
    currentScores: juegoActual.totalIntentos
  };

  res.json({
    result: respuesta,
    gameComplete: false,
    gameState: estadoActualizado
  });
});

// Obtener historial
app.get("/api/history", (req, res) => {
  const historial = obtenerHistorial();
  res.json({ history: historial });
});

// Obtener historial (ruta alternativa que usa el frontend)
app.get("/api/game/history", (req, res) => {
  const historial = obtenerHistorial();
  res.json({ history: historial });
});

// Iniciar servidor
app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
