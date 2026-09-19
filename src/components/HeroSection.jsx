import React from 'react';
import { ChevronDown } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export default function HeroSection({ onScrollToRoster }) {
  const handleCtaClick = () => {
    playClickSound();
    onScrollToRoster();
  };

  const bgUrl = `${import.meta.env.BASE_URL}images/bg.jpg?v=2`;

  return (
    <section
      className="slide-section hero-minimal"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(8, 11, 14, 0.2) 0%, rgba(8, 11, 14, 0.1) 30%, rgba(8, 11, 14, 0.45) 60%, rgba(8, 11, 14, 0.88) 82%, rgba(8, 11, 14, 0.98) 100%), url(${bgUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 10%',
      }}
    >
      <div className="hero-minimal-content bottom-center">
        <span className="hero-minimal-sub">COUNTER-STRIKE 2</span>
        <h1 className="hero-minimal-title">
          <span>TEAM</span> <span className="hero-highlight">PLOV</span>
        </h1>
      </div>

      <div
        className="hero-minimal-scroll interactive-target"
        onClick={handleCtaClick}
        title="Scroll to Roster"
      >
        <span className="scroll-hint">SCROLL</span>
        <ChevronDown size={18} className="scroll-arrow" />
      </div>
    </section>
  );
}
