import { useState, useEffect } from 'react';
import { Timer as TimerIcon, Play, Pause } from 'lucide-react';

interface TimerProps {
  isRunning: boolean;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

const Timer = ({ isRunning, onTimeUpdate, className = '' }: TimerProps) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2">
        {isRunning ? (
          <Play className="w-5 h-5 text-primary animate-pulse" />
        ) : (
          <Pause className="w-5 h-5 text-muted-foreground" />
        )}
        <TimerIcon className="w-5 h-5 text-primary" />
      </div>
      
      <div className="font-mono text-2xl md:text-3xl font-bold">
        <span className={isRunning ? 'text-primary' : 'text-muted-foreground'}>
          {formatTime(time)}
        </span>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {isRunning ? 'Corrida em andamento' : 'Parado'}
      </div>
    </div>
  );
};

export default Timer;