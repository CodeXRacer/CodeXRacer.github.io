import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Users, Copy, Crown, User } from 'lucide-react';
import CodeRain from '@/components/CodeRain';
import PlayerAvatar from '@/components/PlayerAvatar';
import { useRoom } from '@/hooks/useRoom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Lobby = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    currentRoom, 
    participants, 
    loadRoom, 
    loadParticipants, 
    subscribeToParticipants,
    startRace,
    loading 
  } = useRoom();
  
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!roomId) return;
    
    const loadData = async () => {
      await loadRoom(roomId);
      await loadParticipants(roomId);
    };
    
    loadData();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToParticipants(roomId);
    
    return unsubscribe;
  }, [roomId]);

  // Check if current user is room creator
  const isCreator = currentRoom?.created_by === user?.id;

  // Get participant display name
  const getParticipantName = (participant: any) => {
    if (participant.profiles?.display_name) {
      return participant.profiles.display_name;
    }
    return participant.guest_name || 'Participante';
  };

  // Copy room code
  const copyRoomCode = () => {
    if (currentRoom?.room_code) {
      navigator.clipboard.writeText(currentRoom.room_code);
      toast({
        title: "Código copiado!",
        description: `Código da sala: ${currentRoom.room_code}`,
      });
    }
  };

  // Copy room link
  const copyRoomLink = () => {
    const link = `${window.location.origin}/lobby/${roomId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: "Compartilhe este link com seus amigos",
    });
  };

  // Start race with countdown
  const handleStartRace = async () => {
    if (!roomId || !isCreator) return;
    
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          if (prev === 1) {
            // Start the actual race
            startRace(roomId);
            navigate(`/race/${roomId}`);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <CodeRain />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <Card className="neon-card border-primary/30">
            <CardContent className="p-8 text-center">
              <p className="text-lg">Carregando sala...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CodeRain />
      
      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="text-9xl md:text-[12rem] font-black mb-6 animate-bounce-in">
              <span className="matrix-text">
                {countdown || 'GO!'}
              </span>
            </div>
            <div className="text-2xl text-muted-foreground animate-pulse">
              {countdown > 0 ? 'A corrida vai começar...' : 'Começando! ⚡'}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex items-center justify-between max-w-6xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="neon-card border-primary/30"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Sair da Sala
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm font-mono">
              {currentRoom.room_code}
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyRoomCode}
              className="neon-card border-primary/30"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 matrix-text">
            {currentRoom.name}
          </h1>
          <p className="text-muted-foreground text-lg mb-4">
            Aguardando participantes se juntarem à corrida
          </p>
          
          {/* Room Info */}
          <div className="flex justify-center gap-4 mb-6">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {currentRoom.language}
            </Badge>
            <Badge variant="outline" className="border-accent/30">
              <Users className="w-3 h-3 mr-1" />
              {participants.length}/{currentRoom.max_players}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Participants */}
          <div className="lg:col-span-2">
            <Card className="neon-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Participantes ({participants.length}/{currentRoom.max_players})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {participants.map((participant, index) => (
                    <div 
                      key={participant.id}
                      className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-primary/20"
                    >
                      <PlayerAvatar 
                        name={getParticipantName(participant)}
                        size="sm"
                        className="ring-2 ring-primary/30"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {getParticipantName(participant)}
                          </span>
                          {participant.user_id === currentRoom.created_by && (
                            <Crown className="w-4 h-4 text-yellow-400" />
                          )}
                          {!participant.user_id && (
                            <User className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {participant.user_id === user?.id && 'Você'}
                          {participant.user_id === currentRoom.created_by && participant.user_id !== user?.id && 'Criador'}
                          {!participant.user_id && 'Visitante'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-primary font-medium">
                          #{index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: currentRoom.max_players - participants.length }).map((_, index) => (
                    <div 
                      key={`empty-${index}`}
                      className="flex items-center gap-3 p-4 rounded-lg bg-card/20 border border-dashed border-primary/20"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground/50" />
                      </div>
                      <div className="flex-1">
                        <span className="text-muted-foreground">Aguardando...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Room Controls */}
          <div className="space-y-6">
            
            {/* Share Room */}
            <Card className="neon-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Compartilhar Sala</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Código da sala:</p>
                  <div className="flex gap-2">
                    <code className="flex-1 px-3 py-2 bg-muted/50 rounded text-center font-mono text-lg">
                      {currentRoom.room_code}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyRoomCode}
                      className="neon-card border-primary/30"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={copyRoomLink}
                  className="w-full neon-card border-accent/30"
                >
                  Copiar Link Completo
                </Button>
              </CardContent>
            </Card>

            {/* Race Controls */}
            <Card className="neon-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Controles da Corrida</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCreator ? (
                  <Button 
                    onClick={handleStartRace}
                    disabled={participants.length < 2 || loading || countdown !== null}
                    className="w-full hero-button"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {countdown !== null ? 'Iniciando...' : 'Iniciar Corrida'}
                  </Button>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Aguardando o criador iniciar a corrida...
                    </p>
                  </div>
                )}
                
                {participants.length < 2 && (
                  <p className="text-sm text-yellow-400 text-center">
                    Precisa de pelo menos 2 participantes para iniciar
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Room Info */}
            <Card className="neon-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Informações da Sala</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Linguagem:</span>
                  <span>{currentRoom.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={currentRoom.status === 'waiting' ? 'outline' : 'default'}>
                    {currentRoom.status === 'waiting' ? 'Aguardando' : currentRoom.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Máx. Jogadores:</span>
                  <span>{currentRoom.max_players}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criada em:</span>
                  <span>{new Date(currentRoom.created_at).toLocaleTimeString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lobby;