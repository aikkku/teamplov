import React, { useState, useEffect } from 'react';
import {
  Shield,
  Save,
  RotateCcw,
  ArrowLeft,
  Users,
  Bell,
  Sliders,
  FileCode,
  Check,
  ExternalLink,
  MessageSquare,
  BarChart2,
  Key,
  Flame,
  AlertCircle
} from 'lucide-react';
import { getAdminConfig, saveAdminConfig, resetAdminConfig } from '../services/adminConfig';
import { playClickSound, playEngageSound } from '../utils/audio';

const QUICK_PRESETS = [
  { main: "NOT READY YET", sub: "OPERATIVE DOSSIER UNDER RECALIBRATION" },
  { main: "CLASSIFIED OPERATIVE", sub: "ACCESS RESTRICTED BY SQUAD COMMAND" },
  { main: "TOUCHING GRASS", sub: "AFK RECHARGING AIM FOR NEXT OPERATION" },
  { main: "WARMING UP IN AIM_BOTZ", sub: "DRILLING COUNTER-STRAFE & HEADSHOTS" },
  { main: "BENCHED FOR REPAIRS", sub: "HARDWARE UPGRADE IN PROGRESS" },
];

export default function AdminPage({ onReturnToSite }) {
  const [config, setConfig] = useState(() => getAdminConfig());
  const [activeTab, setActiveTab] = useState('players'); // 'players', 'announcement', 'settings', 'backup'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('teamplov_leetify_api_key') || '');
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    setConfig(getAdminConfig());
  }, []);

  const handlePlayerChange = (playerId, field, value) => {
    setConfig((prev) => ({
      ...prev,
      players: {
        ...prev.players,
        [playerId]: {
          ...prev.players[playerId],
          [field]: value,
        },
      },
    }));
  };

  const handlePresetSelect = (playerId, preset) => {
    playClickSound();
    handlePlayerChange(playerId, 'customMessage', preset.main);
    handlePlayerChange(playerId, 'customMessageSub', preset.sub);
  };

  const handleSave = async () => {
    playEngageSound();
    setIsSaving(true);
    if (apiKey) {
      localStorage.setItem('teamplov_leetify_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('teamplov_leetify_api_key');
    }
    await saveAdminConfig(config);
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    playClickSound();
    if (window.confirm('Reset all admin configuration to original defaults?')) {
      const def = resetAdminConfig();
      setConfig(def);
      setApiKey('');
      localStorage.removeItem('teamplov_leetify_api_key');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleCopyJson = () => {
    playClickSound();
    navigator.clipboard?.writeText(JSON.stringify(config, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    playClickSound();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const playerList = Object.values(config.players || {});

  return (
    <div className="admin-page-container">
      {/* Admin Top Header */}
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-logo-box">
            <Shield size={20} color="#4A7B6F" />
          </div>
          <div>
            <h1 className="admin-title">TEAM PLOV // ADMIN CONSOLE</h1>
            <span className="admin-subtitle font-mono">NO LOGIN REQUIRED • LIVE ROSTER & DISPLAY MANAGER</span>
          </div>
        </div>

        <div className="admin-top-actions">
          <button
            className="btn-admin-save interactive-target"
            onClick={handleSave}
          >
            {savedSuccess ? <Check size={16} color="#55ff77" /> : <Save size={16} />}
            <span>{savedSuccess ? 'SAVED TO SITE' : 'SAVE ALL CHANGES'}</span>
          </button>

          <button
            className="btn-admin-return interactive-target"
            onClick={() => {
              playClickSound();
              onReturnToSite();
            }}
          >
            <ArrowLeft size={16} />
            <span>VIEW PUBLIC SITE</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="admin-workspace">
        {/* Left Sidebar Navigation */}
        <aside className="admin-sidebar">
          <button
            className={`admin-nav-item interactive-target ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => { playClickSound(); setActiveTab('players'); }}
          >
            <Users size={16} />
            <span>PLAYERS & DETAILS</span>
          </button>

          <button
            className={`admin-nav-item interactive-target ${activeTab === 'announcement' ? 'active' : ''}`}
            onClick={() => { playClickSound(); setActiveTab('announcement'); }}
          >
            <Bell size={16} />
            <span>SQUAD ANNOUNCEMENT</span>
          </button>

          <button
            className={`admin-nav-item interactive-target ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { playClickSound(); setActiveTab('settings'); }}
          >
            <Sliders size={16} />
            <span>LEETIFY & SETTINGS</span>
          </button>

          <button
            className={`admin-nav-item interactive-target ${activeTab === 'backup' ? 'active' : ''}`}
            onClick={() => { playClickSound(); setActiveTab('backup'); }}
          >
            <FileCode size={16} />
            <span>BACKUP & EXPORT</span>
          </button>

          <div className="admin-sidebar-footer">
            <button
              className="btn-admin-reset interactive-target"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>RESET DEFAULTS</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="admin-content-area">
          {/* TAB 1: PLAYERS & DETAILS MODE */}
          {activeTab === 'players' && (
            <div className="admin-section-block">
              <div className="section-intro">
                <h2>PLAYER DETAILS DISPLAY CONFIGURATION</h2>
                <p>
                  Choose whether clicking each player reveals their full live <strong>Leetify Stats</strong> or a <strong>Big Custom Message</strong> (e.g. <em>"NOT READY YET"</em>).
                </p>
              </div>

              <div className="admin-players-grid">
                {playerList.map((player) => {
                  const isCustom = player.detailsMode === 'custom_message';
                  const playerImg = `${import.meta.env.BASE_URL}${player.image || 'images/default.jpg'}`;

                  return (
                    <div key={player.id} className="admin-player-card">
                      {/* Player Top Banner */}
                      <div className="card-player-header">
                        <div
                          className="player-avatar-thumb"
                          style={{ backgroundImage: `url(${playerImg})` }}
                        />
                        <div className="player-meta-info">
                          <span className="player-callsign font-mono">{player.callsign}</span>
                          <h3 className="player-name-heading">{player.name}</h3>
                          <span className="player-role-badge font-mono">{player.role}</span>
                        </div>

                        {/* MODE SELECTOR */}
                        <div className="mode-toggle-group">
                          <span className="toggle-label font-mono">ON CLICK DISPLAY:</span>
                          <div className="segmented-toggle">
                            <button
                              type="button"
                              className={`toggle-btn interactive-target ${!isCustom ? 'active-mode' : ''}`}
                              onClick={() => handlePlayerChange(player.id, 'detailsMode', 'stats')}
                            >
                              <BarChart2 size={13} />
                              <span>STATS</span>
                            </button>
                            <button
                              type="button"
                              className={`toggle-btn interactive-target ${isCustom ? 'active-mode' : ''}`}
                              onClick={() => handlePlayerChange(player.id, 'detailsMode', 'custom_message')}
                            >
                              <MessageSquare size={13} />
                              <span>BIG MESSAGE</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Custom Message Configuration */}
                      {isCustom ? (
                        <div className="custom-message-panel">
                          <div className="field-row">
                            <label className="admin-label">
                              <span>BIG HEADLINE TEXT</span>
                              <span className="label-tip font-mono">(Displays in huge bold typography)</span>
                            </label>
                            <input
                              type="text"
                              className="admin-input font-mono big-text-input"
                              value={player.customMessage || ''}
                              onChange={(e) => handlePlayerChange(player.id, 'customMessage', e.target.value)}
                              placeholder="e.g. NOT READY YET"
                            />
                          </div>

                          <div className="field-row">
                            <label className="admin-label">
                              <span>SUBTITLE / STATUS EXPLANATION</span>
                            </label>
                            <input
                              type="text"
                              className="admin-input"
                              value={player.customMessageSub || ''}
                              onChange={(e) => handlePlayerChange(player.id, 'customMessageSub', e.target.value)}
                              placeholder="e.g. Operator dossier will unlock after qualifier match"
                            />
                          </div>

                          {/* Quick Presets */}
                          <div className="preset-row">
                            <span className="preset-label font-mono">QUICK PRESETS:</span>
                            <div className="preset-chips">
                              {QUICK_PRESETS.map((preset, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  className="preset-chip interactive-target"
                                  onClick={() => handlePresetSelect(player.id, preset)}
                                >
                                  {preset.main}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Live Preview Box */}
                          <div className="message-live-preview">
                            <span className="preview-watermark font-mono">LIVE PREVIEW ON CLICK</span>
                            <div className="preview-headline">{player.customMessage || 'NOT READY YET'}</div>
                            <div className="preview-sub">{player.customMessageSub || 'DETAILS PENDING'}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="stats-active-notice font-mono">
                          <BarChart2 size={15} color="#55ff77" />
                          <span>LIVE LEETIFY STATS ACTIVE FOR {player.name.toUpperCase()} (AIM, POSITIONING, UTILITY, MATCHES)</span>
                        </div>
                      )}

                      {/* Quick Details Fields */}
                      <div className="player-quick-fields">
                        <div className="field-col">
                          <label className="mini-label font-mono">STEAM64 ID</label>
                          <input
                            type="text"
                            className="admin-mini-input font-mono"
                            value={player.steam64_id || ''}
                            onChange={(e) => handlePlayerChange(player.id, 'steam64_id', e.target.value)}
                            placeholder="76561198..."
                          />
                        </div>

                        <div className="field-col">
                          <label className="mini-label font-mono">ROLE / WEAPON</label>
                          <input
                            type="text"
                            className="admin-mini-input"
                            value={player.favoriteWeapon || ''}
                            onChange={(e) => handlePlayerChange(player.id, 'favoriteWeapon', e.target.value)}
                            placeholder="e.g. AWP / AK-47"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SQUAD ANNOUNCEMENT */}
          {activeTab === 'announcement' && (
            <div className="admin-section-block">
              <div className="section-intro">
                <h2>TOP SQUAD ANNOUNCEMENT BANNER</h2>
                <p>
                  Display a sleek tactical message banner across the top of the website for upcoming scrims, match schedules, or announcements.
                </p>
              </div>

              <div className="admin-card-box">
                <div className="toggle-switch-row">
                  <div>
                    <h3>SHOW ANNOUNCEMENT BANNER</h3>
                    <span className="switch-desc">Visible on main screen for all visitors</span>
                  </div>
                  <button
                    type="button"
                    className={`btn-switch interactive-target ${config.announcement.enabled ? 'switch-on' : ''}`}
                    onClick={() => {
                      playClickSound();
                      setConfig((prev) => ({
                        ...prev,
                        announcement: {
                          ...prev.announcement,
                          enabled: !prev.announcement.enabled,
                        },
                      }));
                    }}
                  >
                    <span>{config.announcement.enabled ? 'ENABLED' : 'DISABLED'}</span>
                  </button>
                </div>

                <div className="field-row" style={{ marginTop: '16px' }}>
                  <label className="admin-label">BANNER MESSAGE TEXT</label>
                  <input
                    type="text"
                    className="admin-input font-mono"
                    value={config.announcement.text || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        announcement: {
                          ...prev.announcement,
                          text: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. NEXT MATCH: TONIGHT 21:00 UTC VS TEAM DUST // PREMIER SQUAD"
                  />
                </div>

                <div className="field-row">
                  <label className="admin-label">BANNER STYLE</label>
                  <div className="banner-type-buttons">
                    {['info', 'warning', 'match'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`type-btn interactive-target ${config.announcement.type === type ? 'active-type' : ''}`}
                        onClick={() => {
                          playClickSound();
                          setConfig((prev) => ({
                            ...prev,
                            announcement: { ...prev.announcement, type },
                          }));
                        }}
                      >
                        {type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Preview */}
                <div className="banner-preview-box">
                  <span className="font-mono preview-tag">PREVIEW:</span>
                  <div className={`preview-banner-bar banner-${config.announcement.type || 'info'}`}>
                    <Flame size={14} />
                    <span className="font-mono">{config.announcement.text || 'ANNOUNCEMENT TEXT'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & LEETIFY */}
          {activeTab === 'settings' && (
            <div className="admin-section-block">
              <div className="section-intro">
                <h2>LEETIFY API & GENERAL CONFIGURATION</h2>
                <p>Manage Leetify Public CS API keys and matchmaking display preferences.</p>
              </div>

              <div className="admin-card-box">
                <div className="field-row">
                  <label className="admin-label">
                    <Key size={14} color="#4A7B6F" />
                    <span>LEETIFY DEVELOPER API KEY (OPTIONAL)</span>
                  </label>
                  <input
                    type="text"
                    className="admin-input font-mono"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste Bearer <key> or _leetify_key token"
                  />
                  <span className="field-help font-mono">
                    Public API works without an API key under default rate limits. Obtained at leetify.com/app/developer.
                  </span>
                </div>

                <div className="field-row">
                  <label className="admin-label">MAX MATCHMAKING GAMES TO DISPLAY</label>
                  <div className="number-selector">
                    {[5, 10, 15, 20].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={`num-btn interactive-target ${config.general.matchLimit === num ? 'active-num' : ''}`}
                        onClick={() => {
                          playClickSound();
                          setConfig((prev) => ({
                            ...prev,
                            general: { ...prev.general, matchLimit: num },
                          }));
                        }}
                      >
                        {num} MATCHES
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field-row">
                  <label className="admin-label">DEFAULT MATCHMAKING FILTER</label>
                  <div className="number-selector">
                    {[
                      { id: 'all', label: 'ALL MATCHMAKING' },
                      { id: 'win', label: 'WINS ONLY' },
                      { id: 'loss', label: 'LOSSES ONLY' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`num-btn interactive-target ${config.general.matchFilterDefault === f.id ? 'active-num' : ''}`}
                        onClick={() => {
                          playClickSound();
                          setConfig((prev) => ({
                            ...prev,
                            general: { ...prev.general, matchFilterDefault: f.id },
                          }));
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field-row" style={{ marginTop: '12px' }}>
                  <label className="admin-label">
                    <span>SHARED CLOUD SYNC URL (OPTIONAL)</span>
                  </label>
                  <input
                    type="text"
                    className="admin-input font-mono"
                    value={config.general?.cloudSyncUrl || ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        general: { ...prev.general, cloudSyncUrl: e.target.value.trim() },
                      }))
                    }
                    placeholder="e.g. https://api.jsonbin.io/v3/b/<bin_id> or Gist raw URL"
                  />
                  <span className="field-help font-mono">
                    Optional: Connect a free public cloud bin (JSONBin / Firebase / Gist) so saving in /admin immediately pushes to all visitors across GitHub Pages.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & EXPORT */}
          {activeTab === 'backup' && (
            <div className="admin-section-block">
              <div className="section-intro">
                <h2>CONFIGURATION BACKUP & DISK SYNC</h2>
                <p>
                  Every time you click <strong>SAVE ALL CHANGES</strong>, it writes directly to <code>public/admin-config.json</code> on disk. When you deploy to GitHub Pages, all visitors automatically receive your exact settings!
                </p>
              </div>

              <div className="admin-card-box">
                <div className="export-actions-row">
                  <button
                    type="button"
                    className="btn-admin-save interactive-target"
                    onClick={handleDownloadJson}
                  >
                    <FileCode size={16} />
                    <span>DOWNLOAD admin-config.json</span>
                  </button>

                  <button
                    type="button"
                    className="btn-admin-return interactive-target"
                    onClick={handleCopyJson}
                  >
                    {copiedJson ? <Check size={16} color="#55ff77" /> : <FileCode size={16} />}
                    <span>{copiedJson ? 'COPIED TO CLIPBOARD' : 'COPY CONFIG JSON'}</span>
                  </button>
                </div>

                <pre className="admin-json-dump font-mono">
                  {JSON.stringify(config, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
