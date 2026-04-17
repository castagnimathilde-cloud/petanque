import { useState, useEffect, useMemo } from 'react';
import { useTournamentStore } from '../store/useTournamentStore';
import { getRankedTeams } from '../utils/standings';

// ── Confetti burst ─────────────────────────────────────────────────────────────

function Confetti() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const pieces = useMemo(() => {
    const colors = ['#FFD700', '#FF6B35', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#E17055', '#74B9FF', '#A29BFE', '#FD79A8'];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.8,
      duration: 2.5 + Math.random() * 2,
      color: colors[i % colors.length],
      size: 7 + Math.random() * 9,
      round: Math.random() > 0.4,
    }));
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className={`absolute top-0 animate-confetti ${p.round ? 'rounded-full' : 'rounded-sm'}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Podium block ───────────────────────────────────────────────────────────────

function PodiumBlock({ team, position, height }) {
  const cfg = {
    1: { medal: '🥇', bg: 'bg-gradient-to-b from-amber-300 to-amber-500', text: 'text-amber-900', border: 'border-amber-400' },
    2: { medal: '🥈', bg: 'bg-gradient-to-b from-gray-200 to-gray-400',   text: 'text-gray-700',  border: 'border-gray-300'  },
    3: { medal: '🥉', bg: 'bg-gradient-to-b from-amber-600 to-amber-800', text: 'text-amber-100', border: 'border-amber-700' },
  }[position];

  if (!team) return <div style={{ height }} className="w-28" />;

  return (
    <div className="flex flex-col items-center animate-pop-in" style={{ animationDelay: `${(position - 1) * 0.15}s` }}>
      <div className="text-center mb-2 px-2">
        <div className="text-3xl mb-1">{cfg.medal}</div>
        <div className="font-black text-navy-600 text-sm leading-tight max-w-28 text-center">{team.nom}</div>
        <div className="text-xs text-gray-500 mt-1">
          {team.v % 1 === 0 ? team.v : team.v.toFixed(1)}V · {team.pts - team.ptsCont > 0 ? '+' : ''}{team.pts - team.ptsCont}
        </div>
      </div>
      <div
        className={`w-24 rounded-t-2xl border-2 ${cfg.bg} ${cfg.border} flex items-end justify-center pb-3 shadow-lg`}
        style={{ height }}
      >
        <span className={`text-3xl font-black ${cfg.text}`}>{position}</span>
      </div>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export default function Resultats() {
  const { getActiveTournoi, goToDashboard, setScreen } = useTournamentStore();
  const tournoi = getActiveTournoi();
  if (!tournoi) return null;

  const ranked = getRankedTeams(tournoi);
  const [winner, second, third] = ranked;

  // Best match stat
  const bestWin = useMemo(() => {
    let best = null;
    for (const m of tournoi.matchs) {
      if (!m.done || m.bye) continue;
      const diff = Math.abs(m.sA - m.sB);
      if (!best || diff > best.diff) {
        const teamA = tournoi.equipes.find((e) => e.id === m.A);
        const teamB = tournoi.equipes.find((e) => e.id === m.B);
        const winner = m.sA > m.sB ? teamA : teamB;
        const loser  = m.sA > m.sB ? teamB : teamA;
        const sW     = Math.max(m.sA, m.sB);
        const sL     = Math.min(m.sA, m.sB);
        best = { diff, winner, loser, sW, sL };
      }
    }
    return best;
  }, [tournoi]);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <>
      <Confetti />

      <div className="max-w-3xl mx-auto p-4 flex flex-col gap-5">
        {/* Winner banner */}
        {winner && (
          <div className="rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 border-2 border-amber-400 p-8 text-center shadow-2xl animate-pop-in">
            <div className="text-6xl mb-3 animate-trophy inline-block">🏆</div>
            <div className="text-4xl font-black text-amber-900 mb-1">{winner.nom}</div>
            {winner.j1 && (
              <div className="text-amber-700 text-sm mb-2 font-medium">
                {winner.j1}{winner.j2 ? ` · ${winner.j2}` : ''}{winner.j3 ? ` · ${winner.j3}` : ''}
              </div>
            )}
            <div className="text-amber-700 font-bold text-lg">
              {winner.v % 1 === 0 ? winner.v : winner.v.toFixed(1)} victoires · {winner.pts} points
            </div>
            <div className="text-amber-600 text-sm mt-2 font-medium">{tournoi.nom}</div>
          </div>
        )}

        {/* Podium */}
        {ranked.length >= 2 && (
          <div className="card text-center overflow-hidden">
            <h3 className="section-title text-center">🎖️ Podium</h3>
            <div className="flex items-end justify-center gap-3 mt-4">
              <PodiumBlock team={second} position={2} height={90} />
              <PodiumBlock team={winner} position={1} height={120} />
              <PodiumBlock team={third || null} position={3} height={65} />
            </div>
          </div>
        )}

        {/* Fun stat */}
        {bestWin && (
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 text-center">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Match du tournoi</p>
            <p className="font-black text-navy-700 text-base">
              {bestWin.winner?.nom} <span className="text-emerald-600">{bestWin.sW}</span>–<span className="text-red-400">{bestWin.sL}</span> {bestWin.loser?.nom}
            </p>
            <p className="text-gray-400 text-xs mt-1">Plus grand écart du tournoi</p>
          </div>
        )}

        {/* Full standings */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-black text-navy-600">Classement final</h3>
            <span className="text-xs text-gray-400">{tournoi.nom}</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-navy-600 to-blue-700 text-white">
                <th className="px-4 py-3 text-center w-10 font-bold">#</th>
                <th className="px-4 py-3 text-left font-bold">Équipe</th>
                <th className="px-4 py-3 text-center w-10 font-bold">V</th>
                <th className="px-4 py-3 text-center w-16 font-bold">Diff</th>
                <th className="px-4 py-3 text-center w-16 font-bold">Pts</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((team, i) => {
                const diff = team.pts - team.ptsCont;
                return (
                  <tr
                    key={team.id}
                    className={`border-t border-gray-100 ${i < 3 ? 'bg-amber-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-3 text-center text-lg">
                      {i < 3 ? medals[i] : <span className="text-gray-400 font-bold text-sm">{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`font-bold ${i < 3 ? 'text-navy-700 font-black' : 'text-gray-800'}`}>{team.nom}</div>
                      {team.j1 && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {team.j1}{team.j2 ? ` · ${team.j2}` : ''}{team.j3 ? ` · ${team.j3}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-black text-emerald-600">
                      {team.v % 1 === 0 ? team.v : team.v.toFixed(1)}
                    </td>
                    <td className={`px-4 py-3 text-center font-black ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {diff > 0 ? '+' : ''}{diff}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700 font-bold">{team.pts}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button className="btn-secondary" onClick={() => setScreen('classement')}>
            📊 Voir le classement détaillé
          </button>
          <button className="btn-ghost text-gray-400" onClick={goToDashboard}>
            ← Retour aux tournois
          </button>
        </div>
      </div>
    </>
  );
}
