import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import PlayerDossier from './PlayerDossier';
import { ROSTER_PLAYERS } from '../config/roster';
import { getPlayerProfile } from '../services/leetifyService';
import { getAdminConfig } from '../services/adminConfig';
import { playEngageSound, playClickSound } from '../utils/audio';

export default function RosterSection({ selectedPlayerId, onSelectPlayer, onCloseDossier }) {
  const [profiles, setProfiles] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [adminConfig, setAdminConfig] = useState(() => getAdminConfig());

  useEffect(() => {
    const handleConfigUpdate = () => {
      setAdminConfig(getAdminConfig());
    };
    window.addEventListener('teamplov_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('teamplov_config_updated', handleConfigUpdate);
  }, []);

  useEffect(() => {
    ROSTER_PLAYERS.forEach(async (p) => {
      const steamId = adminConfig.players?.[p.id]?.steam64_id || p.steam64_id;
      try {
        const data = await getPlayerProfile(steamId);
        if (data) {
          setProfiles((prev) => ({ ...prev, [steamId]: data }));
        }
      } catch (e) {
        console.warn(`Failed to preload ${p.name}:`, e);
      }
    });
  }, [adminConfig]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedPlayerId) {
        onCloseDossier();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPlayerId, onCloseDossier]);

  const handleTileClick = (player) => {
    if (selectedPlayerId === player.id) return;
    playEngageSound();
    onSelectPlayer(player.id);

    if (!profiles[player.steam64_id]) {
      handleRefreshProfile(player.steam64_id);
    }
  };

  const handleRefreshProfile = async (steam64Id) => {
    setLoadingMap((prev) => ({ ...prev, [steam64Id]: true }));
    try {
      const updated = await getPlayerProfile(steam64Id);
      if (updated) {
        setProfiles((prev) => ({ ...prev, [steam64Id]: updated }));
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [steam64Id]: false }));
    }
  };

  const selectedPlayer = ROSTER_PLAYERS.find((p) => p.id === selectedPlayerId);
  const selectedProfile = selectedPlayer ? profiles[selectedPlayer.steam64_id] : null;
  const isDossierOpen = Boolean(selectedPlayer);

  return (
    <section className={`slide-section roster-section-minimal ${isDossierOpen ? 'dossier-active' : ''}`}>
      {/* 5-Column Vertical Tiles Container */}
      <div className="roster-tiles-minimal">
        {ROSTER_PLAYERS.map((player, index) => {
          const isSelected = selectedPlayerId === player.id;
          const isAnotherSelected = isDossierOpen && !isSelected;
          const profile = profiles[player.steam64_id];

          const ranks = profile?.ranks || {};
          const rating = profile?.rating || {};
          const leetifyScore = ranks.leetify !== undefined ? Number(ranks.leetify).toFixed(2) : '--';
          const winrate = profile?.winrate !== undefined ? `${(profile.winrate * 100).toFixed(0)}%` : '--';
          const aimScore = rating.aim !== undefined ? Math.round(rating.aim) : '--';

          const playerConfig = adminConfig.players?.[player.id] || {};
          const photoType = playerConfig.photoType || adminConfig.general?.photoTheme || 'soldier';
          const activeImage = photoType === 'soldier'
            ? (playerConfig.imageAi || player.imageAi || playerConfig.image || player.image)
            : (playerConfig.image || player.image);
          const imageSrc = `${import.meta.env.BASE_URL}${activeImage || 'images/default.jpg'}`;

          return (
            <div
              key={player.id}
              className={`player-tile-minimal interactive-target ${
                isSelected ? 'tile-pinned-left' : ''
              } ${isAnotherSelected ? 'tile-collapsed' : ''}`}
              onClick={() => handleTileClick(player)}
              style={{
                '--player-img': `url(${imageSrc})`,
              }}
            >
              {/* Background Image Layer */}
              <div
                className="tile-bg-image"
                style={{
                  backgroundImage: `url(${imageSrc})`,
                }}
              />

              {/* Dark Gradient Overlay for optimal legibility */}
              <div className="tile-gradient-overlay" />

              {/* Top Index & Callsign */}
              <div className="tile-top-meta">
                <span className="tile-num font-mono">0{index + 1}</span>
                <span className="tile-tag font-mono">{player.callsign}</span>
              </div>

              {/* Bottom Info Lockup */}
              <div className="tile-bottom-info">
                <span className="tile-role">{player.role}</span>
                <h2 className="tile-name">{player.name}</h2>

                {/* Minimalist Stats Summary */}
                <div className="tile-quick-metrics">
                  <div className="metric-chip">
                    <span className="chip-label">LEETIFY</span>
                    <span
                      className="chip-val font-mono"
                      style={{ color: Number(leetifyScore) >= 0 ? '#55ff77' : '#c04949' }}
                    >
                      {Number(leetifyScore) > 0 ? `+${leetifyScore}` : leetifyScore}
                    </span>
                  </div>

                  <div className="metric-chip">
                    <span className="chip-label">WIN</span>
                    <span className="chip-val font-mono">{winrate}</span>
                  </div>

                  <div className="metric-chip">
                    <span className="chip-label">AIM</span>
                    <span className="chip-val font-mono">{aimScore}</span>
                  </div>
                </div>

                {/* Minimalist Action prompt */}
                <div className="tile-open-prompt">
                  <span>{isSelected ? 'OPERATOR ACTIVE' : 'VIEW DOSSIER'}</span>
                  <ChevronRight size={14} className="prompt-arrow" />
                </div>

                {/* Pinned left extra bio when selected */}
                {isSelected && (
                  <div className="pinned-minimal-bio">
                    <p>{player.bio}</p>
                    <span className="pinned-esc-hint font-mono">PRESS [ESC] TO CLOSE</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Detailed Stats Window on Right */}
        {isDossierOpen && (
          <PlayerDossier
            player={selectedPlayer}
            profile={selectedProfile}
            playerConfig={adminConfig.players?.[selectedPlayer.id]}
            isLoading={loadingMap[selectedPlayer.steam64_id]}
            onClose={onCloseDossier}
            onRefresh={handleRefreshProfile}
          />
        )}
      </div>
    </section>
  );
}
