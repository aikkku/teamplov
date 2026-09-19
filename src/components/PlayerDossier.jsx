import React, { useState } from 'react';
import {
  X,
  Copy,
  ExternalLink,
  RefreshCw,
  Award,
  TrendingUp,
  Activity,
  History,
  CheckCircle,
  XCircle,
  Target,
  Zap,
} from 'lucide-react';
import { playClickSound, playBackSound } from '../utils/audio';
import { ArrowLeft } from 'lucide-react';

export default function PlayerDossier({
  player,
  profile,
  playerConfig,
  isLoading,
  onClose,
  onRefresh,
}) {
  const [copied, setCopied] = useState(false);
  const [matchFilter, setMatchFilter] = useState('all');

  const handleCopySteam = () => {
    playClickSound();
    if (player?.steam64_id) {
      navigator.clipboard?.writeText(player.steam64_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    playBackSound();
    onClose();
  };

  const handleRefreshClick = () => {
    playClickSound();
    onRefresh(player.steam64_id);
  };

  if (!player) return null;

  // If player is configured for Big Custom Message
  if (playerConfig?.detailsMode === 'custom_message') {
    const mainMsg = playerConfig.customMessage || 'NOT READY YET';
    const subMsg = playerConfig.customMessageSub || 'OPERATIVE PROFILE UNDER RECALIBRATION';

    return (
      <div className="dossier-minimal dossier-custom-message-view">
        <div className="dossier-minimal-header">
          <div className="dossier-minimal-title-group">
            <span className="dossier-minimal-sub font-mono">{player.callsign} // {player.role}</span>
            <h2 className="dossier-minimal-name">{player.name}</h2>
          </div>
          <div className="dossier-minimal-controls">
            <button
              className="btn-minimal-close interactive-target"
              onClick={handleClose}
              title="Close [Esc]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="custom-message-full-body">
          <div className="custom-message-box">
            <div className="custom-status-pill font-mono">
              <span className="status-dot-blink" />
              <span>OPERATOR STATUS: RESTRICTED</span>
            </div>

            <h1 className="custom-headline-text">{mainMsg}</h1>
            <p className="custom-sub-text">{subMsg}</p>

            <div className="custom-action-row">
              <button
                className="btn-minimal-highlight interactive-target"
                onClick={handleClose}
              >
                <ArrowLeft size={16} />
                <span>RETURN TO SQUAD</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rating = profile?.rating || {};
  const stats = profile?.stats || {};
  const ranks = profile?.ranks || {};
  const matches = (profile?.recent_matches || []).filter((m) => {
    if (matchFilter === 'win') return m.outcome === 'win';
    if (matchFilter === 'loss') return m.outcome === 'loss';
    return true;
  });

  const leetifyScore = ranks.leetify !== undefined ? Number(ranks.leetify).toFixed(2) : '--';
  const winratePct = profile?.winrate !== undefined ? (profile.winrate * 100).toFixed(1) : '--';
  const totalMatches = profile?.total_matches || 0;

  return (
    <div className="dossier-minimal">
      {/* Dossier Header Bar */}
      <div className="dossier-minimal-header">
        <div className="dossier-minimal-title-group">
          <span className="dossier-minimal-sub font-mono">{player.callsign} // {player.role}</span>
          <h2 className="dossier-minimal-name">{player.name}</h2>

          <div className="dossier-minimal-meta">
            <span className="font-mono steam-id-text">STEAM: {player.steam64_id}</span>
            <button
              className="btn-minimal-chip interactive-target"
              onClick={handleCopySteam}
              title="Copy Steam64 ID"
            >
              <Copy size={12} />
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
            <a
              href={`https://leetify.com/app/profile/${player.steam64_id}`}
              target="_blank"
              rel="noreferrer"
              className="btn-minimal-chip interactive-target"
              title="Open profile on Leetify"
            >
              <ExternalLink size={12} />
              <span>LEETIFY</span>
            </a>
          </div>
        </div>

        {/* Minimal Controls */}
        <div className="dossier-minimal-controls">
          <button
            className={`btn-minimal-chip interactive-target ${isLoading ? 'rotating' : ''}`}
            onClick={handleRefreshClick}
            disabled={isLoading}
            title="Sync live from Leetify"
          >
            <RefreshCw size={13} className={isLoading ? 'spin-anim' : ''} />
            <span>{isLoading ? 'SYNCING' : 'SYNC'}</span>
          </button>

          <button
            className="btn-minimal-close interactive-target"
            onClick={handleClose}
            title="Close Dossier [Esc]"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="dossier-minimal-body">
        {/* Top 4 Summary Cards */}
        <div className="dossier-minimal-summary-grid">
          <div className="summary-minimal-card">
            <div className="card-top">
              <Award size={14} color="#4A7B6F" />
              <span>LEETIFY RATING</span>
            </div>
            <div
              className="card-main-val font-mono"
              style={{ color: Number(leetifyScore) >= 0 ? '#55ff77' : '#c04949' }}
            >
              {Number(leetifyScore) > 0 ? `+${leetifyScore}` : leetifyScore}
            </div>
            <div className="card-sub">Overall Matchmaking Impact</div>
          </div>

          <div className="summary-minimal-card">
            <div className="card-top">
              <TrendingUp size={14} color="#CCDDDD" />
              <span>MM WINRATE</span>
            </div>
            <div className="card-main-val font-mono">
              {winratePct}%
            </div>
            <div className="card-sub">{totalMatches} recorded operations</div>
          </div>

          <div className="summary-minimal-card">
            <div className="card-top">
              <Zap size={14} color="#4A7B6F" />
              <span>REACTION TIME</span>
            </div>
            <div className="card-main-val font-mono">
              {stats.reaction_time_ms ? `${Math.round(stats.reaction_time_ms)}ms` : '--'}
            </div>
            <div className="card-sub">Time to fire on spotted enemy</div>
          </div>

          <div className="summary-minimal-card">
            <div className="card-top">
              <Target size={14} color="#CCDDDD" />
              <span>HEADSHOT ACCURACY</span>
            </div>
            <div className="card-main-val font-mono">
              {stats.accuracy_head ? `${Number(stats.accuracy_head).toFixed(1)}%` : '--'}
            </div>
            <div className="card-sub">Head hit ratio in duels</div>
          </div>
        </div>

        {/* Combat Rating Matrix */}
        <div className="dossier-minimal-panel">
          <div className="panel-minimal-title">
            <Activity size={15} color="#4A7B6F" />
            <span>COMBAT RATING MATRIX</span>
          </div>

          <div className="rating-minimal-grid">
            <RatingMinimalBar label="AIM" value={rating.aim} color="#4A7B6F" />
            <RatingMinimalBar label="POSITIONING" value={rating.positioning} color="#64a696" />
            <RatingMinimalBar label="UTILITY" value={rating.utility} color="#9EAEB3" />
            <RatingMinimalBar
              label="CLUTCH"
              value={rating.clutch !== undefined ? rating.clutch * 100 + 50 : null}
              rawDisplay={rating.clutch !== undefined ? `${rating.clutch > 0 ? '+' : ''}${rating.clutch.toFixed(3)}` : null}
              color="#CCDDDD"
            />
          </div>

          <div className="side-minimal-row">
            <div className="side-minimal-tag">
              <span className="side-lbl ct-color">CT LEETIFY</span>
              <span className="font-mono">
                {rating.ct_leetify !== undefined ? `${rating.ct_leetify > 0 ? '+' : ''}${rating.ct_leetify.toFixed(4)}` : '--'}
              </span>
            </div>
            <div className="side-minimal-tag">
              <span className="side-lbl t-color">T LEETIFY</span>
              <span className="font-mono">
                {rating.t_leetify !== undefined ? `${rating.t_leetify > 0 ? '+' : ''}${rating.t_leetify.toFixed(4)}` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Gunplay Telemetry */}
        <div className="dossier-minimal-panel">
          <div className="panel-minimal-title">
            <Target size={15} color="#4A7B6F" />
            <span>GUNPLAY & MOVEMENT METRICS</span>
          </div>

          <div className="telemetry-minimal-grid">
            <div className="telemetry-chip">
              <span className="chip-lbl">SPOTTED ACCURACY</span>
              <span className="chip-num font-mono">{stats.accuracy_enemy_spotted ? `${stats.accuracy_enemy_spotted.toFixed(1)}%` : '--'}</span>
            </div>
            <div className="telemetry-chip">
              <span className="chip-lbl">PREAIM ACCURACY</span>
              <span className="chip-num font-mono">{stats.preaim ? `${stats.preaim.toFixed(1)}°` : '--'}</span>
            </div>
            <div className="telemetry-chip">
              <span className="chip-lbl">SPRAY ACCURACY</span>
              <span className="chip-num font-mono">{stats.spray_accuracy ? `${stats.spray_accuracy.toFixed(1)}%` : '--'}</span>
            </div>
            <div className="telemetry-chip">
              <span className="chip-lbl">COUNTER-STRAFING</span>
              <span className="chip-num font-mono">{stats.counter_strafing_good_shots_ratio ? `${stats.counter_strafing_good_shots_ratio.toFixed(1)}%` : '--'}</span>
            </div>
            <div className="telemetry-chip">
              <span className="chip-lbl">TRADE KILLS</span>
              <span className="chip-num font-mono">{stats.trade_kills_success_percentage ? `${stats.trade_kills_success_percentage.toFixed(1)}%` : '--'}</span>
            </div>
            <div className="telemetry-chip">
              <span className="chip-lbl">FOE BLIND DURATION</span>
              <span className="chip-num font-mono">{stats.flashbang_hit_foe_avg_duration ? `${stats.flashbang_hit_foe_avg_duration.toFixed(2)}s` : '--'}</span>
            </div>
          </div>
        </div>

        {/* Steam Matchmaking History */}
        <div className="dossier-minimal-panel">
          <div className="panel-header-flex">
            <div className="panel-minimal-title">
              <History size={15} color="#4A7B6F" />
              <span>STEAM MATCHMAKING ({matches.length})</span>
            </div>

            <div className="filter-minimal-tabs">
              <button
                className={`tab-minimal interactive-target ${matchFilter === 'all' ? 'active' : ''}`}
                onClick={() => { playClickSound(); setMatchFilter('all'); }}
              >
                ALL
              </button>
              <button
                className={`tab-minimal interactive-target ${matchFilter === 'win' ? 'active' : ''}`}
                onClick={() => { playClickSound(); setMatchFilter('win'); }}
              >
                WINS
              </button>
              <button
                className={`tab-minimal interactive-target ${matchFilter === 'loss' ? 'active' : ''}`}
                onClick={() => { playClickSound(); setMatchFilter('loss'); }}
              >
                LOSSES
              </button>
            </div>
          </div>

          <div className="matches-minimal-list">
            {matches.length === 0 ? (
              <div className="empty-matches font-mono">
                NO MATCHMAKING OPERATIONS FOUND
              </div>
            ) : (
              matches.map((m, idx) => {
                const isWin = m.outcome === 'win';
                const formattedMap = (m.map_name || 'de_dust2').replace('de_', '').replace('cs_', '').toUpperCase();
                const score = Array.isArray(m.score) ? `${m.score[0]} : ${m.score[1]}` : 'N/A';
                const ratingFormatted = m.leetify_rating !== undefined
                  ? `${m.leetify_rating > 0 ? '+' : ''}${Number(m.leetify_rating).toFixed(4)}`
                  : null;

                return (
                  <div key={m.id || idx} className="match-minimal-row interactive-target">
                    <div className="match-left">
                      {isWin ? (
                        <span className="badge-outcome win">WIN</span>
                      ) : (
                        <span className="badge-outcome loss">LOSS</span>
                      )}
                      <span className="match-map-text font-mono">{formattedMap}</span>
                    </div>

                    <div className="match-center font-mono">
                      {score}
                    </div>

                    <div className="match-right font-mono">
                      {ratingFormatted && (
                        <span style={{ color: Number(m.leetify_rating) >= 0 ? '#55ff77' : '#c04949' }}>
                          {ratingFormatted}
                        </span>
                      )}
                      {m.reaction_time_ms && (
                        <span className="match-sub-stat">{Math.round(m.reaction_time_ms)}ms</span>
                      )}
                      <span className="match-date-text">
                        {m.finished_at ? new Date(m.finished_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingMinimalBar({ label, value, color, rawDisplay }) {
  const numericVal = typeof value === 'number' ? Math.max(0, Math.min(100, value)) : 0;
  return (
    <div className="rating-mini-item">
      <div className="rating-mini-labels">
        <span className="mini-lbl">{label}</span>
        <span className="mini-val font-mono">{rawDisplay || (value !== null && value !== undefined ? numericVal.toFixed(1) : '--')}</span>
      </div>
      <div className="mini-track">
        <div
          className="mini-fill"
          style={{
            width: `${numericVal}%`,
            backgroundColor: color || '#4A7B6F',
            boxShadow: `0 0 10px ${color}88`,
          }}
        />
      </div>
    </div>
  );
}
