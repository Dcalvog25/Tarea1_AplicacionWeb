function MainMenu({ onPlayNow, onShowHistory }) {
  return (
    <div className="main-menu">
      <button 
        className="menu-button play-button"
        onClick={onPlayNow}
      >
        <span className="button-icon">🎮</span>
        <span className="button-text">JUEGA YA</span>
      </button>
      
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
