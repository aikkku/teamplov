import React, { useEffect, useState } from 'react';
import { playShotSound } from '../utils/audio';

export default function CrosshairCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isFiring, setIsFiring] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if device supports fine cursor (desktop/mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over clickable element
      const target = e.target;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('.interactive-target'))
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => {
      setIsFiring(true);
      playShotSound();
    };

    const handleMouseUp = () => {
      setIsFiring(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="cs2-crosshair-wrapper"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`,
      }}
      aria-hidden="true"
    >
      <div className={`cs2-crosshair ${isFiring ? 'firing' : ''} ${isHovering ? 'hovering' : ''}`}>
        {/* Center Dot */}
        <div className="cs2-crosshair-dot" />

        {/* 4 CS2 Crosshair ticks */}
        <div className="cs2-tick cs2-tick-top" />
        <div className="cs2-tick cs2-tick-bottom" />
        <div className="cs2-tick cs2-tick-left" />
        <div className="cs2-tick cs2-tick-right" />
      </div>
    </div>
  );
}
