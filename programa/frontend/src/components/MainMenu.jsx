/**
 * Componente del menú principal de la aplicación
 * Proporcionar navegación clara hacia las funciones principales del juego
 * Los usuarios necesitan un punto de entrada intuitivo para acceder a todas las características
 */
function MainMenu({ onPlayNow, onShowHistory }) {
  return (
    <div className="main-menu">
      {/* 
        BOTÓN PRINCIPAL DE JUEGO
        Iniciar el flujo para crear una nueva partida
        Es la acción principal que los usuarios realizarán
      */}
      <button 
        className="menu-button play-button"
        onClick={onPlayNow}
      >
        <span className="button-icon">🎮</span>
        <span className="button-text">JUEGA YA</span>
      </button>
      
      {/* 
        ACCESO AL HISTORIAL
        Permitir revisar partidas anteriores y estadísticas
        Los jugadores quieren ver su progreso y comparar rendimientos
      */}
      <button 
        className="menu-button history-button"
        onClick={onShowHistory}
      >
        <span className="button-icon">📊</span>
        <span className="button-text">HISTORIAL</span>
      </button>
    </div>
  );
}

export default MainMenu;
