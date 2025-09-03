import { useState, useEffect, useRef } from 'react';

interface CodeDisplayProps {
  code: string;
  currentPosition: number;
  userInput: string;
}

const CodeDisplay = ({ code, currentPosition, userInput }: CodeDisplayProps) => {
  const getCharClass = (index: number) => {
    if (index < userInput.length) {
      if (userInput[index] === code[index]) {
        return 'text-green-400 bg-green-400/20 border border-green-400/30 rounded-sm scale-105';
      } else {
        return 'text-red-400 bg-red-400/30 border border-red-400/50 rounded-sm animate-pulse';
      }
    } else if (index === currentPosition) {
      return 'bg-primary/40 border border-primary rounded-sm animate-pulse shadow-lg';
    }
    return 'text-muted-foreground/80 hover:text-muted-foreground transition-colors';
  };

  const correctChars = userInput.split('').filter((char, index) => char === code[index]).length;
  const progressPercentage = (userInput.length / code.length) * 100;
  const accuracyPercentage = userInput.length > 0 ? (correctChars / userInput.length) * 100 : 100;

  return (
    <div className="h-full flex flex-col neon-card bg-gradient-to-br from-card/90 to-background/50 backdrop-blur-xl border-primary/30 hover:border-primary/50 transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold matrix-text flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse"></div>
              Código para Digitar
            </h3>
            <div className="text-sm text-muted-foreground mt-1">
              JavaScript • Função de validação • {code.length} caracteres
            </div>
          </div>
          
          {/* Mini Progress Indicator */}
          <div className="text-right">
            <div className="text-sm font-bold text-primary">{userInput.length}/{code.length}</div>
            <div className="w-20 h-2 bg-background/50 rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Code Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="relative">
          <pre className="whitespace-pre-wrap font-mono text-base leading-7 selection:bg-primary/20">
            {code.split('').map((char, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-200 ${getCharClass(index)}`}
                style={{
                  transformOrigin: 'center',
                  textShadow: index === currentPosition ? '0 0 8px hsl(var(--primary))' : undefined
                }}
              >
                {char === ' ' ? '\u00A0' : char === '\n' ? '\n' : char}
              </span>
            ))}
          </pre>
          
          {/* Cursor indicator */}
          {currentPosition < code.length && (
            <div 
              className="absolute w-0.5 h-7 bg-primary animate-pulse shadow-lg"
              style={{
                left: `${currentPosition * 0.6}ch`,
                top: `${Math.floor(currentPosition / 50) * 1.75}rem`
              }}
            />
          )}
        </div>
      </div>
      
      {/* Footer Stats */}
      <div className="p-4 border-t border-primary/20 bg-background/20">
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-primary font-bold">{progressPercentage.toFixed(1)}%</div>
            <div className="text-muted-foreground text-xs">Progresso</div>
          </div>
          <div>
            <div className="text-accent font-bold">{accuracyPercentage.toFixed(1)}%</div>
            <div className="text-muted-foreground text-xs">Precisão</div>
          </div>
          <div>
            <div className="text-yellow-400 font-bold">{correctChars}</div>
            <div className="text-muted-foreground text-xs">Corretos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeDisplay;