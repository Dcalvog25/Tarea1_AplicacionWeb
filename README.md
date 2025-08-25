# Tarea1_AplicacionWeb

## Información Académica

**Curso:** IC4700 Lenguajes de Programación  
**Semestre:** II Semestre, 2025  
**Estudiante:** David Calvo García  
**Carnet:** 2024122451  
**Tarea:** Tarea#1  
**Fecha de Entrega:** 24 de agosto del 2025  
**Estatus de la Entrega:** Excelente  

---

## Descripción del Proyecto

Aplicación web de **Batalla de Números** - Un juego competitivo entre dos jugadores donde cada uno debe adivinar números aleatorios generados por el sistema a través de 6 rondas alternadas.

### Tecnologías Utilizadas

- **Frontend:** React.js + Vite
- **Backend:** Node.js + Express.js
- **Almacenamiento:** JSON (historial de partidas)
- **Comunicación:** API REST

### Características Principales

- ✅ Sistema de turnos alternados entre jugadores
- ✅ Generación aleatoria de números (1-100)
- ✅ Sistema de pistas direccionales ("mayor"/"menor")
- ✅ Cálculo automático de ganador basado en intentos y tiempo
- ✅ Historial persistente de partidas
- ✅ Interfaz gráfica intuitiva con animaciones
- ✅ Manejo de empates y desempates

### Estructura del Proyecto

```
programa/
├── backend/           # Servidor Express.js
│   ├── index.js      # API REST y lógica del juego
│   ├── package.json  # Dependencias del backend
│   └── game_history.json  # Historial de partidas
└── frontend/         # Aplicación React
    ├── src/
    │   ├── App.jsx   # Componente principal
    │   └── components/  # Componentes modulares
    ├── package.json  # Dependencias del frontend
    └── index.html    # Punto de entrada
```

### Instalación y Ejecución

#### Backend
```bash
cd programa/backend
npm install
node index.js
```

#### Frontend
```bash
cd programa/frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (frontend) comunicándose con `http://localhost:5000` (backend).

### Video Demostrativo
Puede acceder al video demostrativo disponible en el siguiente link ```https://drive.google.com/file/d/11ij8nTqq8rCsGwcm3NSeyitWhsdaDCSJ/view?usp=sharing```
