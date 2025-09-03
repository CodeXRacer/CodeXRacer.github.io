import { useEffect, useState } from 'react';

const CodeRain = () => {
  const [drops, setDrops] = useState<Array<{ id: number; left: number; delay: number; chars: string[] }>>([]);

  const codeChars = ['0', '1', '{', '}', '(', ')', ';', '=', '+', '-', '*', '/', 'if', 'for', 'var', 'let', 'const', 'function', 'return'];

  useEffect(() => {
    const newDrops = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      chars: Array.from({ length: 8 }, () => codeChars[Math.floor(Math.random() * codeChars.length)])
    }));
    setDrops(newDrops);
  }, []);

  return (
    <div className="code-rain">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="absolute text-primary/20 text-sm font-mono animate-pulse-slow"
          style={{
            left: `${drop.left}%`,
            animationDelay: `${drop.delay}s`,
            animation: `fadeInOut 4s ease-in-out infinite ${drop.delay}s`
          }}
        >
          {drop.chars.map((char, i) => (
            <div key={i} className="mb-2">{char}</div>
          ))}
        </div>
      ))}
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(-20px); }
          50% { opacity: 0.3; transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

export default CodeRain;