import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, Link2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import CodeRain from '@/components/CodeRain';
import { useToast } from '@/hooks/use-toast';
import { useRoom } from '@/hooks/useRoom';
import { useAuth } from '@/hooks/useAuth';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { joinRoom, loading } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [guestName, setGuestName] = useState('');

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Código necessário",
        description: "Digite o código da sala para entrar.",
        variant: "destructive"
      });
      return;
    }

    // If user is not logged in, require guest name
    if (!user && !guestName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Digite seu nome para entrar como visitante.",
        variant: "destructive"
      });
      return;
    }

    // Extract room code from link or use directly
    let code = roomCode.trim();
    if (code.includes('/lobby/')) {
      code = code.split('/lobby/')[1];
    } else if (code.includes('/room/')) {
      code = code.split('/room/')[1];
    }

    const room = await joinRoom(code, guestName);
    if (room) {
      navigate(`/lobby/${room.id}`);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRoomCode(text);
      toast({
        title: "Texto colado!",
        description: "Agora você pode entrar na sala.",
      });
    } catch (error) {
      toast({
        title: "Erro ao colar",
        description: "Não foi possível acessar a área de transferência.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CodeRain />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex items-center max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="neon-card border-primary/30"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-20 px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 matrix-text">
              Entrar na Sala
            </h1>
            <p className="text-muted-foreground text-lg">
              Digite o código da sala para entrar na corrida
            </p>
          </div>

          <Card className="neon-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Conectar à Sala
              </CardTitle>
              <CardDescription>
                Digite o código da sala que você recebeu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roomCode">Código da Sala</Label>
                <div className="flex gap-2">
                  <Input
                    id="roomCode"
                    placeholder="ABC123 ou cole o link completo"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="neon-card border-primary/30 text-center font-mono text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePaste}
                    className="neon-card border-primary/30 hover:border-primary/50"
                  >
                    Colar
                  </Button>
                </div>
              </div>

              {!user && (
                <div className="space-y-2">
                  <Label htmlFor="guestName">Seu Nome (visitante)</Label>
                  <Input
                    id="guestName"
                    placeholder="Digite seu nome"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="neon-card border-primary/30"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                </div>
              )}

              <Button 
                onClick={handleJoinRoom}
                className="w-full hero-button"
                size="lg"
                disabled={loading || !roomCode.trim() || (!user && !guestName.trim())}
              >
                <Link2 className="w-4 h-4 mr-2" />
                {loading ? 'Entrando...' : 'Entrar na Sala'}
              </Button>

              {/* Alternative */}
              <div className="text-center pt-4 border-t border-primary/20">
                <p className="text-muted-foreground text-sm mb-4">
                  Não tem uma sala ainda?
                </p>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/create-room')}
                  className="neon-card border-accent/50 hover:border-accent"
                >
                  Criar Nova Sala
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default JoinRoom;