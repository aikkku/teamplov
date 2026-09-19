import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, Users, Radio, Settings } from 'lucide-react';
import { toggleAudio, isAudioEnabled, playClickSound } from '../utils/audio';

export default function Navbar({ activeSlide, onNavigate, onOpenSettings }) {
  const [audioActive, setAudioActive] = useState(isAudioEnabled());

  const handleAudioToggle = () => {
    const newState = toggleAudio();
    setAudioActive(newState);
    if (newState) playClickSound();
  };

  const handleNavClick = (index) => {
    playClickSound();
    onNavigate(index);
  };

  return (
    <header className="navbar-container">
      {/* Brand Identity */}
      <div className="nav-brand" onClick={() => handleNavClick(0)}>
        <div className="nav-logo-box">
          <Shield size={18} color="#4A7B6F" />
        </div>
        <div className="nav-brand-text">
          <span className="nav-brand-title">TEAM PLOV</span>
          <span className="nav-brand-tag">[ CS2 SQUADRON ]</span>
        </div>
      </div>

      {/* Center Tactical Status */}
      <div className="nav-status-badge">
        <span className="status-indicator-dot" />
        <span className="status-label">VALVE MATCHMAKING PROTOCOL</span>
        <span className="status-divider">|</span>
        <span className="status-leetify">LEETIFY OAS 3.1 ACTIVE</span>
      </div>

      {/* Navigation Buttons */}
      <nav className="nav-actions">
        <button
          className={`nav-btn ${activeSlide === 0 ? 'active' : ''}`}
          onClick={() => handleNavClick(0)}
          title="Go to Welcome Slide"
        >
          <Radio size={14} />
          <span>01 // BRIEFING</span>
        </button>

        <button
          className={`nav-btn ${activeSlide === 1 ? 'active' : ''}`}
          onClick={() => handleNavClick(1)}
          title="Go to 5-Stack Roster"
        >
          <Users size={14} />
          <span>02 // ROSTER (5)</span>
        </button>

        <button
          className="nav-btn-icon"
          onClick={handleAudioToggle}
          title={audioActive ? 'Mute CS2 UI SFX' : 'Enable CS2 UI SFX'}
        >
          {audioActive ? <Volume2 size={16} color="#55ff77" /> : <VolumeX size={16} color="#9EAEB3" />}
        </button>

        <button
          className="nav-btn-icon"
          onClick={() => {
            playClickSound();
            onOpenSettings();
          }}
          title="Configure Player Steam64 IDs / API Key"
        >
          <Settings size={16} color="#CCDDDD" />
        </button>
      </nav>
    </header>
  );
}
