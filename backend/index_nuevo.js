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

// Función para número aleatorio
function crearNumero() {
  return Math.floor(Math.random() * 100) + 1;
}

// Función para tiempo en formato simple
function formatearTiempo(ms) {
  const seg = Math.floor(ms / 1000);
  const min = Math.floor(seg / 60);
  const segSobrantes = seg % 60;
  
  if (min > 0) {
    return min + "m " + segSobrantes + "s";
  }
  return seg + "s";
}

// Leer historial de archivo
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

// Guardar partida terminada
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

// Empezar nueva partida
app.post("/api/game/start", (req, res) => {
  const { player1, player2 } = req.body;
  
  // Validar que lleguen los nombres
  if (!player1 || !player2) {
    return res.status(400).json({ error: "Necesito los dos nombres" });
  }

  // Quien empieza (aleatorio)
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
    empezeLaRonda: Date.now(),
    empezeLaPartida: Date.now(),
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

// Procesar intento de adivinar
app.post("/api/game/guess", (req, res) => {
  const { guess } = req.body;
  
  // Validar que hay juego
  if (!juegoActual) {
    return res.status(400).json({ error: "No hay juego iniciado" });
  }

  const miIntento = parseInt(guess);
  
  // Validar número
  if (isNaN(miIntento) || miIntento < 1 || miIntento > 100) {
    return res.status(400).json({ error: "Número debe ser entre 1 y 100" });
  }

  // Agregar intento
  juegoActual.intentosDeLaRonda.push({
    number: miIntento,
    player: juegoActual.nombres[juegoActual.turno]
  });

  let respuesta;
  let rondaCompleta = false;

  // Ver si acertó
  if (miIntento === juegoActual.numero) {
    respuesta = "¡Correcto! 🎉";
    rondaCompleta = true;
  } else if (miIntento < juegoActual.numero) {
    respuesta = "El número es mayor 📈";
  } else {
    respuesta = "El número es menor 📉";
  }

  console.log(`🎯 ${miIntento} vs ${juegoActual.numero} → ${respuesta}`);

  // Si terminó la ronda
  if (rondaCompleta) {
    const cuantoTardo = Date.now() - juegoActual.empezeLaRonda;
    
    // Sumar estadísticas
    juegoActual.totalIntentos[juegoActual.turno] += juegoActual.intentosDeLaRonda.length;
    juegoActual.totalTiempo[juegoActual.turno] += cuantoTardo;
    
    // Guardar info de esta ronda
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
    
    // Ver si terminó el juego (6 rondas)
    if (juegoActual.ronda >= 6) {
      // Calcular quien ganó
      let ganador;
      let empateCompleto = false;
      
      // Primero por intentos
      if (juegoActual.totalIntentos[0] < juegoActual.totalIntentos[1]) {
        ganador = juegoActual.nombres[0];
      } else if (juegoActual.totalIntentos[1] < juegoActual.totalIntentos[0]) {
        ganador = juegoActual.nombres[1];
      } else {
        // Empate en intentos, ver tiempo
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
        tiempoCompleto: Date.now() - juegoActual.empezeLaPartida,
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
        totalGameTime: Date.now() - juegoActual.empezeLaPartida
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
      juegoActual.empezeLaRonda = Date.now();
      
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

// Iniciar servidor
app.listen(puerto, () => {
  console.log(`Servidor corriendo en http://localhost:${puerto}`);
});
