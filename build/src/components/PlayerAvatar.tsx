import { cn } from "@/lib/utils";

interface PlayerAvatarProps {
  src?: string;
  name: string;
  status?: 'ready' | 'waiting' | 'racing' | 'finished';
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PlayerAvatar = ({ 
  src, 
  name, 
  status = 'waiting', 
  progress = 0, 
  size = 'md',
  className 
}: PlayerAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-20 h-20 text-base'
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'border-primary shadow-lg shadow-primary/25';
      case 'racing': return 'border-accent shadow-lg shadow-accent/25';
      case 'finished': return 'border-yellow-400 shadow-lg shadow-yellow-400/25';
      default: return 'border-muted-foreground/30';
    }
  };

  const getStatusAnimation = () => {
    switch (status) {
      case 'ready': return 'animate-pulse-slow';
      case 'racing': return 'animate-bounce-in';
      case 'finished': return 'pulse-glow';
      default: return '';
    }
  };

  return (
    <div className={cn("relative flex flex-col items-center gap-1", className)}>
      <div className={cn(
        "relative rounded-full border-2 overflow-hidden transition-all duration-300 shadow-lg",
        sizeClasses[size],
        getStatusColor(),
        getStatusAnimation()
      )}>
        {src ? (
          <img 
            src={src} 
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {status === 'racing' && (
          <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent" />
        )}
      </div>
      
      {/* Compact name display for sm size */}
      {size === 'sm' ? (
        <div className="text-center">
          <p className="text-xs text-foreground/90 font-medium truncate max-w-[60px]">
            {name.length > 6 ? name.substring(0, 6) + '...' : name}
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs text-foreground/80 font-medium truncate max-w-[80px]">
            {name}
          </p>
          {status === 'racing' && (
            <p className="text-xs text-accent font-bold">
              {progress}%
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerAvatar;