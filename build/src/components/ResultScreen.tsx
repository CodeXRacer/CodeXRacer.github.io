import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home, Share2 } from 'lucide-react';
import PlayerAvatar from './PlayerAvatar';
import { useNavigate } from 'react-router-dom';

interface ResultPlayer {
  id: string;
  name: string;
  avatar?: string;
  time: string;
  wpm: number;
  accuracy: number;
  position: number;
}

interface ResultScreenProps {
  players: ResultPlayer[];
  raceTime: number;
  onPlayAgain?: () => void;
  onBackToHome?: () => void;
}

const ResultScreen = ({ players, raceTime, onPlayAgain, onBackToHome }: ResultScreenProps) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);
  
  const winner = players.find(p => p.position === 1);
  const currentPlayer = players.find(p => p.id === 'current'); // Assuming current player has id 'current'
  
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const shareResult = () => {
    const text = `Acabei de participar de uma CodeRace! Terminei em ${currentPlayer?.position}º lugar com ${currentPlayer?.wpm} WPM. Vem correr também! 🏁`;
    
    if (navigator.share) {
      navigator.share({
        title: 'CodeRace - Resultado da Corrida',
        text: text,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-primary rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="neon-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center p-8 border-b border-primary/20">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce-in" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🎉 Corrida Finalizada!
          </h1>
          {winner && (
            <p className="text-xl text-primary mb-2">
              <strong>{winner.name}</strong> venceu!
            </p>
          )}
          <p className="text-muted-foreground">
            Tempo total: {formatTime(raceTime)}
          </p>
        </div>

        {/* Results */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Classificação Final</h2>
          
          <div className="space-y-4 mb-8">
            {players.map((player) => (
              <div 
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 ${
                  player.position === 1 
                    ? 'border-yellow-400/50 bg-yellow-400/10' 
                    : player.position === 2 
                    ? 'border-gray-300/50 bg-gray-300/10'
                    : player.position === 3
                    ? 'border-orange-400/50 bg-orange-400/10'
                    : 'border-primary/20 bg-primary/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${
                    player.position === 1 ? 'text-yellow-400' :
                    player.position === 2 ? 'text-gray-300' :
                    player.position === 3 ? 'text-orange-400' :
                    'text-muted-foreground'
                  }`}>
                    #{player.position}
                  </div>
                  
                  <PlayerAvatar
                    src={player.avatar}
                    name={player.name}
                    status="finished"
                    size="sm"
                  />
                  
                  <div>
                    <p className="font-semibold text-foreground">{player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {player.time} • {player.accuracy}% precisão
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {player.wpm}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    WPM
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Your Performance */}
          {currentPlayer && (
            <div className="neon-card bg-primary/10 p-4 mb-6">
              <h3 className="font-semibold text-primary mb-2">Sua Performance</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">#{currentPlayer.position}</div>
                  <div className="text-xs text-muted-foreground">Posição</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">{currentPlayer.wpm}</div>
                  <div className="text-xs text-muted-foreground">WPM</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{currentPlayer.accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Precisão</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onPlayAgain}
              className="flex-1 hero-button"
              size="lg"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Jogar Novamente
            </Button>
            
            <Button 
              variant="outline"
              onClick={shareResult}
              className="flex-1 neon-card border-accent/50 hover:border-accent"
              size="lg"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 neon-card border-primary/30"
              size="lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;