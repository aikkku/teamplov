import React, { useState, useRef, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import RosterSection from './components/RosterSection';
import CrosshairCursor from './components/CrosshairCursor';
import AdminPage from './pages/AdminPage';
import { getAdminConfig } from './services/adminConfig';
import { Shield, Flame, AlertCircle, Info } from 'lucide-react';
import { playClickSound } from './utils/audio';

function checkIsAdminRoute() {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path.endsWith('/admin') || hash.includes('/admin') || hash === '#admin';
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(checkIsAdminRoute);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [adminConfig, setAdminConfig] = useState(() => getAdminConfig());
  const viewportRef = useRef(null);

  // Sync route on popstate / hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdmin(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Listen for admin config updates
  useEffect(() => {
    const handleConfigUpdate = () => {
      setAdminConfig(getAdminConfig());
    };
    window.addEventListener('teamplov_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('teamplov_config_updated', handleConfigUpdate);
  }, []);

  const navigateTo = (route) => {
    if (route === '/admin') {
      window.location.hash = '/admin';
      setIsAdmin(true);
    } else {
      window.location.hash = '';
      if (window.location.pathname.endsWith('/admin')) {
        window.history.pushState(null, '', window.location.pathname.replace(/\/admin\/?$/, '') || '/');
      }
      setIsAdmin(false);
    }
  };

  const handleScroll = () => {
    if (!viewportRef.current) return;
    const scrollTop = viewportRef.current.scrollTop;
    const height = window.innerHeight;
    const slide = Math.round(scrollTop / height);
    if (slide !== activeSlide) {
      setActiveSlide(slide);
    }
  };

  const scrollToSlide = (slideIndex) => {
    if (!viewportRef.current) return;
    viewportRef.current.scrollTo({
      top: slideIndex * window.innerHeight,
      behavior: 'smooth',
    });
    setActiveSlide(slideIndex);
  };

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAdmin) return;

      if (!selectedPlayerId) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          scrollToSlide(1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          scrollToSlide(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlayerId, isAdmin]);

  // If on /admin route, render AdminPage
  if (isAdmin) {
    return (
      <div className="app-container">
        <CrosshairCursor />
        <AdminPage onReturnToSite={() => navigateTo('/')} />
      </div>
    );
  }

  const announcement = adminConfig?.announcement;

  return (
    <div className="app-container">
      {/* Dynamic CS2 Green Crosshair Cursor */}
      <CrosshairCursor />

      {/* Top Announcement Bar if enabled by Admin */}
      {announcement?.enabled && (
        <div className={`global-announcement-bar banner-${announcement.type || 'info'}`}>
          <div className="announcement-content font-mono">
            {announcement.type === 'match' && <Flame size={14} />}
            {announcement.type === 'warning' && <AlertCircle size={14} />}
            {announcement.type === 'info' && <Info size={14} />}
            <span>{announcement.text || 'TEAM PLOV // ANNOUNCEMENT'}</span>
          </div>
        </div>
      )}

      {/* Fullscreen Slideshow Viewport */}
      <main
        className="slideshow-viewport"
        ref={viewportRef}
        onScroll={handleScroll}
      >
        {/* Slide 1: Welcome / Hero Briefing */}
        <HeroSection onScrollToRoster={() => scrollToSlide(1)} />

        {/* Slide 2: 5-Stack Roster (Full Height Vertical Tiles + Slide-to-Left Dossier) */}
        <RosterSection
          selectedPlayerId={selectedPlayerId}
          onSelectPlayer={setSelectedPlayerId}
          onCloseDossier={() => setSelectedPlayerId(null)}
        />
      </main>

      {/* Discreet Admin Quick Link (Icon only for least visibility) */}
      <button
        className="discreet-admin-link interactive-target"
        onClick={() => {
          playClickSound();
          navigateTo('/admin');
        }}
        title="Admin Console"
        aria-label="Admin Console"
      >
        <Shield size={13} />
      </button>
    </div>
  );
}
