import React, { useState } from 'react';
import { X, Key, Shield, User, Save, RefreshCw, Check } from 'lucide-react';
import { ROSTER_PLAYERS } from '../config/roster';
import { playClickSound, playBackSound } from '../utils/audio';

export default function SettingsModal({ isOpen, onClose, onSaveCustomIds }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('teamplov_leetify_api_key') || '');
  const [steamIds, setSteamIds] = useState(() => {
    const saved = localStorage.getItem('teamplov_custom_steam_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    const initial = {};
    ROSTER_PLAYERS.forEach((p) => {
      initial[p.id] = p.steam64_id;
    });
    return initial;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSteamIdChange = (playerId, val) => {
    setSteamIds((prev) => ({ ...prev, [playerId]: val.trim() }));
  };

  const handleSave = () => {
    playClickSound();
    if (apiKey) {
      localStorage.setItem('teamplov_leetify_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('teamplov_leetify_api_key');
    }
    localStorage.setItem('teamplov_custom_steam_ids', JSON.stringify(steamIds));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);

    if (onSaveCustomIds) {
      onSaveCustomIds(steamIds, apiKey.trim());
    }
  };

  const handleReset = () => {
    playClickSound();
    const defaults = {};
    ROSTER_PLAYERS.forEach((p) => {
      defaults[p.id] = p.steam64_id;
    });
    setSteamIds(defaults);
    setApiKey('');
    localStorage.removeItem('teamplov_leetify_api_key');
    localStorage.removeItem('teamplov_custom_steam_ids');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container corner-box scanlines"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Shield size={18} color="#4A7B6F" />
            <h2>CONFIG & STEAM64 OPERATOR SETTINGS</h2>
          </div>
          <button
            className="modal-close-btn interactive-target"
            onClick={() => {
              playBackSound();
              onClose();
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-instruction">
            Modify Steam64 IDs to point to your squad's live accounts or enter an optional Leetify Developer API key to increase rate limits.
          </p>

          {/* API Key Input */}
          <div className="modal-field-block">
            <label className="field-label">
              <Key size={14} color="#4A7B6F" />
              <span>LEETIFY API KEY (OPTIONAL)</span>
            </label>
            <input
              type="text"
              className="tactical-input font-mono"
              placeholder="Bearer <key> or _leetify_key token"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <span className="field-help">
              Public API works without key with increased rate limits. Keys can be generated at leetify.com/app/developer.
            </span>
          </div>

          {/* Roster Steam64 IDs */}
          <div className="modal-roster-fields">
            <label className="field-label">
              <User size={14} color="#CCDDDD" />
              <span>SQUAD OPERATOR STEAM64 IDS</span>
            </label>

            {ROSTER_PLAYERS.map((player) => (
              <div key={player.id} className="roster-input-row">
                <div className="roster-player-badge font-mono">
                  <span className="badge-name">{player.name}</span>
                  <span className="badge-role">{player.role}</span>
                </div>
                <input
                  type="text"
                  className="tactical-input font-mono"
                  value={steamIds[player.id] || ''}
                  onChange={(e) => handleSteamIdChange(player.id, e.target.value)}
                  placeholder="76561198..."
                />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-tactical-outline interactive-target"
            onClick={handleReset}
          >
            <RefreshCw size={14} />
            <span>RESET DEFAULTS</span>
          </button>

          <button
            className="btn-tactical cut-corner-br interactive-target"
            onClick={handleSave}
          >
            {savedSuccess ? <Check size={16} color="#55ff77" /> : <Save size={16} />}
            <span>{savedSuccess ? 'SAVED SUCCESSFULLY' : 'APPLY CHANGES'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
