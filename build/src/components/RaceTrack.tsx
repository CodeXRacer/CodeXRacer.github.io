import { useState, useEffect } from 'react';
import PlayerAvatar from './PlayerAvatar';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  progress: number;
  wpm: number;
  status: 'racing' | 'finished';
  position: number;
}

interface RaceTrackProps {
  players: Player[];
  raceLength: number;
}

const RaceTrack = ({ players, raceLength }: RaceTrackProps) => {
  const getPositionPercentage = (progress: number) => {
    return Math.min((progress / raceLength) * 100, 100);
  };

  const sortedPlayers = [...players].sort((a, b) => b.progress - a.progress);

  return (
    <div className="h-20 neon-card bg-gradient-to-r from-card/90 via-primary/5 to-card/90 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300 overflow-visible">
      
      {/* Single Race Track */}
      <div className="px-6 py-4 h-full flex flex-col justify-center overflow-visible">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold matrix-text flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            Progresso da Corrida
          </h3>
          <div className="text-xs text-muted-foreground">
            {sortedPlayers.filter(p => p.status === 'finished').length}/{players.length} finalizado
          </div>
        </div>

        {/* Main Progress Track */}
        <div className="relative h-8 bg-gradient-to-r from-background/60 via-muted/40 to-background/60 rounded-full border border-primary/30 overflow-visible">
          
          {/* Track Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full"></div>
          
          {/* Finish Line */}
          <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-r-full"></div>
          
          {/* Start Line */}
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-l-full"></div>
          
          {/* Progress Markers */}
          <div className="absolute inset-0 flex justify-between items-center px-2">
            {[25, 50, 75].map((marker) => (
              <div key={marker} className="w-px h-4 bg-muted-foreground/30"></div>
            ))}
          </div>
          
          {/* Players positioned along the track */}
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-500 ease-out z-30"
              style={{ 
                left: `${Math.min(Math.max(getPositionPercentage(player.progress), 4), 96)}%`,
              }}
            >
              <div className="relative group">
                <PlayerAvatar
                  src={player.avatar}
                  name={player.name}
                  status={player.status}
                  size="sm"
                  className={`${player.status === 'racing' ? 'animate-bounce-in' : ''} ${
                    player.status === 'finished' ? 'pulse-glow' : ''
                  } drop-shadow-xl cursor-pointer hover:scale-110 transition-transform duration-200`}
                />
                
                {/* Player Info Tooltip */}
                <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-40">
                  <div className="bg-background/95 backdrop-blur-sm border border-primary/30 rounded-lg px-3 py-2 text-center shadow-lg">
                    <div className="text-xs font-bold text-foreground">{player.name}</div>
                    <div className="text-xs text-accent">{player.wpm} WPM</div>
                    <div className="text-xs text-primary">{getPositionPercentage(player.progress).toFixed(0)}%</div>
                    {player.status === 'finished' && (
                      <div className="text-xs text-yellow-400 font-bold">🏁 Finalizado</div>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-background/95 border-r border-b border-primary/30 transform rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                </div>

                {/* Position Badge */}
                <div className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black border-2 ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900 border-yellow-300' :
                  index === 1 ? 'bg-gray-300 text-gray-800 border-gray-200' :
                  index === 2 ? 'bg-amber-600 text-amber-100 border-amber-500' :
                  'bg-muted text-muted-foreground border-muted-foreground/30'
                } shadow-lg`}>
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RaceTrack;