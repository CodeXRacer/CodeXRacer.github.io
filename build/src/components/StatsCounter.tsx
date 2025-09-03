import { useEffect, useState } from 'react';

interface StatsCounterProps {
  label: string;
  value: number;
  duration?: number;
  suffix?: string;
}

const StatsCounter = ({ label, value, duration = 2000, suffix = '' }: StatsCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <div className="text-center p-4 neon-card animate-fade-in">
      <div className="text-2xl md:text-3xl font-bold matrix-text mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground">
        {label}
      </div>
    </div>
  );
};

export default StatsCounter;