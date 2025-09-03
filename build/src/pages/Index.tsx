import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Code, Users, Zap, Github, Play } from "lucide-react";
import CodeRain from '@/components/CodeRain';
import StatsCounter from '@/components/StatsCounter';
import RankingCard from '@/components/RankingCard';
import UserMenu from '@/components/UserMenu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRankings } from '@/hooks/useRankings';
import { useStats } from '@/hooks/useStats';

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('week');
  const { rankings, loading: rankingsLoading } = useRankings();
  const { stats, loading: statsLoading } = useStats();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CodeRain />
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Code className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold matrix-text">CodeRace</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="neon-card border-primary/30">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <UserMenu />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 text-center py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="matrix-text">Code</span>
            <span className="text-foreground"> vs </span>
            <span className="matrix-text">Speed</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-slide-up">
            Compete em corridas de digitação de código em tempo real. 
            <br />
            Escolha sua linguagem, convide amigos e veja quem é mais rápido!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="hero-button animate-bounce-in"
              onClick={() => navigate('/create-room')}
            >
              <Play className="w-5 h-5 mr-2" />
              Criar Sala Agora
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="neon-card border-accent/50 hover:border-accent"
              onClick={() => navigate('/join-room')}
            >
              <Users className="w-5 h-5 mr-2" />
              Entrar numa Sala
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <StatsCounter 
              label="Corridas Hoje" 
              value={statsLoading ? 0 : stats.racesToday} 
            />
            <StatsCounter 
              label="Jogadores Online" 
              value={statsLoading ? 0 : stats.playersOnline} 
            />
            <StatsCounter 
              label="Linhas Digitadas" 
              value={statsLoading ? 0 : Math.floor(stats.linesTyped / 1000)} 
              suffix="k" 
            />
          </div>
        </div>
      </section>

      {/* Rankings Section */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <Trophy className="inline w-8 h-8 mr-2 text-yellow-400" />
              Rankings
            </h2>
            <p className="text-muted-foreground">Os mais rápidos digitadores de código</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 neon-card mb-8">
              <TabsTrigger value="week" className="data-[state=active]:bg-primary/20">
                <Zap className="w-4 h-4 mr-2" />
                Semana
              </TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-primary/20">
                <Trophy className="w-4 h-4 mr-2" />
                Mês
              </TabsTrigger>
              <TabsTrigger value="allTime" className="data-[state=active]:bg-primary/20">
                <Code className="w-4 h-4 mr-2" />
                All Time
              </TabsTrigger>
            </TabsList>

            {Object.entries(rankings).map(([period, periodRankings]) => (
              <TabsContent key={period} value={period} className="space-y-4">
                {rankingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando rankings...</p>
                  </div>
                ) : periodRankings.length > 0 ? (
                  periodRankings.map((player, index) => (
                    <RankingCard 
                      key={`${period}-${index}`}
                      rank={index + 1}
                      player={player}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 neon-card">
                    <p className="text-muted-foreground">Nenhuma corrida encontrada para este período</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-primary/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            Feito com ❤️ para a comunidade dev. Open source no GitHub.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
