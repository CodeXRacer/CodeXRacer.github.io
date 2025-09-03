import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, Settings, Users, Timer, Lock, Unlock } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';
import CodeRain from '@/components/CodeRain';
import { useToast } from '@/hooks/use-toast';
import { useRoom } from '@/hooks/useRoom';

const CreateRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createRoom, loading } = useRoom();
  const [roomConfig, setRoomConfig] = useState({
    language: '',
    difficulty: '',
    maxPlayers: 5,
    isPrivate: false,
    roomName: ''
  });
  const [roomCode, setRoomCode] = useState<string>('');

  const handleCreateRoom = async () => {
    if (!roomConfig.language || !roomConfig.difficulty) {
      toast({
        title: "Configuração incompleta",
        description: "Selecione a linguagem e dificuldade para criar a sala.",
        variant: "destructive"
      });
      return;
    }

    const room = await createRoom({
      name: roomConfig.roomName,
      language: roomConfig.language,
      difficulty: roomConfig.difficulty,
      maxPlayers: roomConfig.maxPlayers,
      isPrivate: roomConfig.isPrivate
    });

    if (room) {
      setRoomCode(room.room_code);
      const roomLink = `${window.location.origin}/lobby/${room.id}`;
      
      navigator.clipboard.writeText(roomLink);
      toast({
        title: "Sala criada! 🎉",
        description: `Código da sala: ${room.room_code}. Link copiado para a área de transferência.`,
      });

      // Navigate to lobby
      navigate(`/lobby/${room.id}`);
    }
  };

  const copyLink = () => {
    if (roomCode) {
      const roomLink = `${window.location.origin}/lobby/${roomCode}`;
      navigator.clipboard.writeText(roomLink);
      toast({
        title: "Link copiado!",
        description: "Compartilhe com seus amigos para eles entrarem na sala.",
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
      <main className="relative z-10 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 matrix-text">
              Criar Nova Sala
            </h1>
            <p className="text-muted-foreground text-lg">
              Configure sua corrida de código e convide seus amigos
            </p>
          </div>

          <Card className="neon-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Configurações da Sala
              </CardTitle>
              <CardDescription>
                Defina as regras da sua corrida de código
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Room Name */}
              <div className="space-y-2">
                <Label htmlFor="roomName">Nome da Sala (opcional)</Label>
                <Input
                  id="roomName"
                  placeholder="Ex: Corrida dos Devs"
                  value={roomConfig.roomName}
                  onChange={(e) => setRoomConfig(prev => ({ ...prev, roomName: e.target.value }))}
                  className="neon-card border-primary/30"
                />
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <Label>Linguagem de Programação</Label>
                <LanguageSelector 
                  value={roomConfig.language}
                  onValueChange={(value) => setRoomConfig(prev => ({ ...prev, language: value }))}
                />
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select 
                  value={roomConfig.difficulty} 
                  onValueChange={(value) => setRoomConfig(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="neon-card border-primary/30">
                    <SelectValue placeholder="Escolha a dificuldade" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/30">
                    <SelectItem value="easy">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-green-400" />
                        <span>Fácil (2-3 linhas)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-yellow-400" />
                        <span>Médio (4-6 linhas)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hard">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-red-400" />
                        <span>Difícil (7-10 linhas)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Players */}
              <div className="space-y-2">
                <Label>Máximo de Jogadores</Label>
                <Select 
                  value={roomConfig.maxPlayers.toString()} 
                  onValueChange={(value) => setRoomConfig(prev => ({ ...prev, maxPlayers: parseInt(value) }))}
                >
                  <SelectTrigger className="neon-card border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/30">
                    {Array.from({ length: 9 }, (_, i) => i + 2).map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-accent" />
                          <span>{num} jogadores</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Privacy */}
              <div className="space-y-2">
                <Label>Privacidade</Label>
                <Select 
                  value={roomConfig.isPrivate ? 'private' : 'public'} 
                  onValueChange={(value) => setRoomConfig(prev => ({ ...prev, isPrivate: value === 'private' }))}
                >
                  <SelectTrigger className="neon-card border-primary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-primary/30">
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Unlock className="w-4 h-4 text-green-400" />
                        <span>Pública (qualquer um com link entra)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-yellow-400" />
                        <span>Privada (apenas convidados)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Room Code Preview */}
              {roomCode && (
                <div className="space-y-2 pt-4 border-t border-primary/20">
                  <Label>Código da Sala</Label>
                  <div className="flex gap-2">
                    <Input
                      value={roomCode}
                      readOnly
                      className="neon-card border-primary/30 bg-muted/50 text-center font-mono text-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyLink}
                      className="neon-card border-primary/30 hover:border-primary/50"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Compartilhe este código ou o link com seus amigos
                  </p>
                </div>
              )}

              {/* Create Button */}
              <Button 
                onClick={handleCreateRoom}
                className="w-full hero-button"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Criando sala...' : 'Criar Sala e Entrar no Lobby'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateRoom;