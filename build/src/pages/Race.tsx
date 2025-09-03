import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Play, Users, Keyboard } from 'lucide-react';
import CodeRain from '@/components/CodeRain';
import CodeDisplay from '@/components/CodeDisplay';
import RaceTrack from '@/components/RaceTrack';
import Timer from '@/components/Timer';
import ResultScreen from '@/components/ResultScreen';
import { useToast } from '@/hooks/use-toast';
import { useRoom } from '@/hooks/useRoom';
import { useAuth } from '@/hooks/useAuth';

// Sample code snippets for different languages
const codeSnippets = {
  javascript: `function validateEmail(email) {
  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return regex.test(email.toLowerCase());
}

const isValid = validateEmail("test@example.com");
console.log("Email is valid:", isValid);`,
  
  python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
  
  java: `public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        int result = add(5, 3);
        System.out.println("Result: " + result);
    }
}`
};

// Mock players data
const mockPlayers = [
  { id: 'current', name: 'Você', avatar: '', progress: 0, wpm: 0, status: 'racing' as 'racing' | 'finished', position: 1 },
  { id: '2', name: 'DevNinja', avatar: '', progress: 0, wpm: 0, status: 'racing' as 'racing' | 'finished', position: 2 },
  { id: '3', name: 'CodeMaster', avatar: '', progress: 0, wpm: 0, status: 'racing' as 'racing' | 'finished', position: 3 },
  { id: '4', name: 'TypeHero', avatar: '', progress: 0, wpm: 0, status: 'racing' as 'racing' | 'finished', position: 4 }
];

const Race = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    currentRoom, 
    participants, 
    loadRoom, 
    loadParticipants, 
    subscribeToParticipants,
    updateProgress 
  } = useRoom();
  
  // Race state
  const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'racing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [raceTime, setRaceTime] = useState(0);
  
  // Code and typing state
  const [currentCode, setCurrentCode] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentPosition, setCurrentPosition] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Players state
  const [players, setPlayers] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load room data on mount
  useEffect(() => {
    if (!roomId) return;
    
    const loadData = async () => {
      const room = await loadRoom(roomId);
      if (room) {
        setCurrentCode(room.code_snippet);
        if (room.status === 'racing') {
          // Race already started
          setGameState('racing');
          setStartTime(Date.now());
          textareaRef.current?.focus();
        }
      }
      await loadParticipants(roomId);
    };
    
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToParticipants(roomId);
    
    return unsubscribe;
  }, [roomId]);

  // Convert participants to players format
  useEffect(() => {
    const convertedPlayers = participants.map((p, index) => ({
      id: p.id,
      name: p.profiles?.display_name || p.guest_name || 'Participante',
      avatar: p.profiles?.avatar_url || '',
      progress: p.progress,
      wpm: p.wpm,
      status: p.finished_at ? 'finished' : 'racing',
      position: index + 1,
      accuracy: p.accuracy
    }));
    setPlayers(convertedPlayers);
  }, [participants]);

  // Calculate WPM
  const calculateWPM = () => {
    if (!startTime || raceTime === 0) return 0;
    const minutes = raceTime / 60;
    const wordsTyped = userInput.length / 5; // Standard: 5 characters = 1 word
    return Math.round(wordsTyped / minutes);
  };

  // Calculate accuracy
  const calculateAccuracy = () => {
    if (userInput.length === 0) return 100;
    const correctChars = userInput.split('').filter((char, index) => char === currentCode[index]).length;
    return Math.round((correctChars / userInput.length) * 100);
  };

  // Handle countdown
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('racing');
      setStartTime(Date.now());
      textareaRef.current?.focus();
    }
  }, [gameState, countdown]);

  // Start race
  const startRace = () => {
    setGameState('countdown');
    setCountdown(3);
    setUserInput('');
    setCurrentPosition(0);
    setErrors(0);
    setRaceTime(0);
    
    toast({
      title: "Corrida iniciada! 🏁",
      description: "Prepare-se para a contagem regressiva!",
    });
  };

  // Handle typing
  const handleInputChange = async (value: string) => {
    if (gameState !== 'racing') return;
    
    setUserInput(value);
    setCurrentPosition(value.length);
    
    // Count errors
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== currentCode[i]) {
        errorCount++;
      }
    }
    setErrors(errorCount);
    
    // Calculate progress and update database
    const progress = Math.floor((value.length / currentCode.length) * 100);
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    
    if (roomId) {
      await updateProgress(roomId, progress, wpm, accuracy);
    }
    
    // Check if finished
    if (value === currentCode) {
      setGameState('finished');
      setTimeout(() => setShowResults(true), 1000);
      
      toast({
        title: "Parabéns! 🎉",
        description: "Você completou a corrida!",
      });
    }
  };

  // Update timer
  useEffect(() => {
    if (gameState === 'racing') {
      const interval = setInterval(() => {
        setRaceTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Generate final results
  const generateResults = () => {
    const finalPlayers = players
      .map((player, index) => ({
        ...player,
        time: `${Math.floor(raceTime / 60)}:${(raceTime % 60).toString().padStart(2, '0')}`,
        accuracy: player.id === 'current' ? calculateAccuracy() : Math.floor(85 + Math.random() * 15),
        position: index + 1
      }))
      .sort((a, b) => b.progress - a.progress)
      .map((player, index) => ({ ...player, position: index + 1 }));
    
    return finalPlayers;
  };

  if (showResults) {
    return (
      <ResultScreen
        players={generateResults()}
        raceTime={raceTime}
        onPlayAgain={() => {
          setShowResults(false);
          setGameState('waiting');
          setUserInput('');
          setCurrentPosition(0);
          setErrors(0);
          setRaceTime(0);
          setStartTime(null);
        }}
        onBackToHome={() => navigate('/')}
      />
    );
  }

  return (
    <div className="h-screen overflow-hidden relative bg-gradient-to-br from-background via-background to-card">
      <CodeRain />
      
      {/* Fixed Header */}
      <header className="relative z-10 p-3">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="neon-card border-primary/50 hover:bg-primary/10 transition-all duration-300"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sair da Corrida
          </Button>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 neon-card bg-card/60">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Sala: {currentRoom?.room_code || roomId}</span>
            </div>
            <Timer 
              isRunning={gameState === 'racing'} 
              onTimeUpdate={setRaceTime}
              className="neon-card px-6 py-2 bg-primary/10 border-primary/30"
            />
          </div>
        </nav>
      </header>

      {/* Countdown Overlay */}
      {gameState === 'countdown' && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="text-9xl md:text-[12rem] font-black mb-6 animate-bounce-in">
              <span className="matrix-text">
                {countdown || 'GO!'}
              </span>
            </div>
            <div className="text-2xl text-muted-foreground animate-pulse">
              {countdown > 0 ? 'Prepare-se...' : 'Comece a digitar! ⚡'}
            </div>
            <div className="mt-4 h-2 bg-card rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                style={{ width: countdown > 0 ? `${((3 - countdown) / 3) * 100}%` : '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Stats Bar */}
      <div className="relative z-10 px-6 py-3 bg-gradient-to-r from-card/95 via-background/90 to-card/95 backdrop-blur-xl border-b border-primary/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-7 gap-4 items-center">
            
            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-bold text-red-400">AO VIVO</span>
            </div>
            
            {/* Stats */}
            <div className="text-center">
              <div className="text-lg font-black text-primary">{calculateWPM()}</div>
              <div className="text-xs text-muted-foreground">WPM</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-black text-accent">{calculateAccuracy()}%</div>
              <div className="text-xs text-muted-foreground">Precisão</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-black text-yellow-400">{userInput.length}</div>
              <div className="text-xs text-muted-foreground">Chars</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-black text-red-400">{errors}</div>
              <div className="text-xs text-muted-foreground">Erros</div>
            </div>
            
            {/* Game Info */}
            <div className="text-center">
              <span className="text-sm font-bold text-yellow-400 px-2 py-1 bg-yellow-400/10 rounded">{currentRoom?.language || 'JavaScript'}</span>
              <div className="text-xs text-muted-foreground">Linguagem</div>
            </div>
            
            {/* Status */}
            <div className="text-center">
              <div>
                <span className={`text-sm font-bold px-2 py-1 rounded flex items-center gap-1 justify-center ${
                  gameState === 'countdown' ? 'text-orange-400 bg-orange-400/10' :
                  gameState === 'racing' ? 'text-primary bg-primary/10' :
                  'text-green-400 bg-green-400/10'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    gameState === 'countdown' ? 'bg-orange-400' :
                    gameState === 'racing' ? 'bg-primary' :
                    'bg-green-400'
                  }`}></div>
                  {gameState === 'countdown' ? 'Iniciando' :
                   gameState === 'racing' ? 'Correndo' :
                   'Finalizada'}
                </span>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Racing Interface */}
      <main className="relative z-10 p-6 max-w-7xl mx-auto h-[calc(100vh-160px)] flex flex-col gap-6">
        
        {/* Code Display & Typing Area */}
        <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
          
          {/* Left: Code Display */}
          <div className="min-h-0">
            <CodeDisplay 
              code={currentCode}
              currentPosition={currentPosition}
              userInput={userInput}
            />
          </div>
          
          {/* Right: Typing Area */}
          <div className="neon-card bg-card/80 backdrop-blur-lg border-primary/30 hover:border-primary/50 transition-all duration-300 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-primary/20">
              <h3 className="text-lg font-bold matrix-text flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Área de Digitação
              </h3>
            </div>
            
            <div className="flex-1 p-4">
              <Textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={gameState === 'waiting' ? 'Clique em "Iniciar" para começar...' : 'Digite o código aqui...'}
                className="h-full font-mono text-lg bg-background/50 border-primary/20 focus:border-primary/60 rounded-lg resize-none transition-all duration-300"
                disabled={gameState !== 'racing'}
              />
            </div>
          </div>
        </div>

        {/* Race Progress Bar */}
        <div className="h-20">
          <RaceTrack players={players} raceLength={currentCode.length || 100} />
        </div>
      </main>
    </div>
  );
};

export default Race;