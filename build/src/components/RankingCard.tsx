import PlayerAvatar from './PlayerAvatar';

interface RankingCardProps {
  rank: number;
  player: {
    name: string;
    avatar?: string;
    language: string;
    time: string;
    wpm: number;
  };
}

const RankingCard = ({ rank, player }: RankingCardProps) => {
  const getRankColor = () => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-muted-foreground';
    }
  };

  const getRankIcon = () => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  return (
    <div className="neon-card p-4 hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`text-xl font-bold ${getRankColor()}`}>
            {getRankIcon()}
          </div>
          <PlayerAvatar 
            src={player.avatar}
            name={player.name}
            size="sm"
            status="finished"
          />
          <div>
            <p className="font-semibold text-foreground">{player.name}</p>
            <p className="text-xs text-accent">{player.language}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{player.time}</p>
          <p className="text-xs text-muted-foreground">{player.wpm} WPM</p>
        </div>
      </div>
    </div>
  );
};

export default RankingCard;