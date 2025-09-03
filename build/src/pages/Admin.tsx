import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Code, Settings, FileText, BarChart3, Github, Globe } from 'lucide-react';

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<any>({});
  const [codeSnippets, setCodeSnippets] = useState<any[]>([]);
  
  // New snippet form state
  const [newSnippet, setNewSnippet] = useState({
    title: '',
    language: 'javascript',
    content: '',
    category: 'general',
    difficulty: 'medium'
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
      return;
    }
    
    if (isAdmin) {
      loadConfigs();
      loadCodeSnippets();
    }
  }, [isAdmin, loading, navigate]);

  const loadConfigs = async () => {
    try {
      const { data } = await supabase
        .from('admin_configs')
        .select('*');
      
      const configsMap: Record<string, any> = {};
      data?.forEach(config => {
        try {
          configsMap[config.key] = JSON.parse(config.value as string);
        } catch {
          configsMap[config.key] = config.value;
        }
      });
      setConfigs(configsMap);
    } catch (error) {
      console.error('Error loading configs:', error);
    }
  };

  const loadCodeSnippets = async () => {
    try {
      const { data } = await supabase
        .from('code_snippets')
        .select('*')
        .order('created_at', { ascending: false });
      
      setCodeSnippets(data || []);
    } catch (error) {
      console.error('Error loading code snippets:', error);
    }
  };

  const updateConfig = async (key: string, value: any) => {
    try {
      await supabase
        .from('admin_configs')
        .upsert({ key, value: JSON.stringify(value) });
      
      setConfigs(prev => ({ ...prev, [key]: value }));
      toast.success('Configuração atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar configuração');
    }
  };

  const createCodeSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase
        .from('code_snippets')
        .insert([newSnippet]);
      
      toast.success('Código criado com sucesso!');
      setNewSnippet({
        title: '',
        language: 'javascript',
        content: '',
        category: 'general',
        difficulty: 'medium'
      });
      loadCodeSnippets();
    } catch (error) {
      toast.error('Erro ao criar código');
    }
  };

  const deleteCodeSnippet = async (id: string) => {
    try {
      await supabase
        .from('code_snippets')
        .delete()
        .eq('id', id);
      
      toast.success('Código removido!');
      loadCodeSnippets();
    } catch (error) {
      toast.error('Erro ao remover código');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="neon-card border-primary/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold matrix-text">Painel de Administração</h1>
        </header>

        <Tabs defaultValue="snippets" className="w-full">
          <TabsList className="grid w-full grid-cols-3 neon-card mb-8">
            <TabsTrigger value="snippets" className="data-[state=active]:bg-primary/20">
              <Code className="w-4 h-4 mr-2" />
              Códigos
            </TabsTrigger>
            <TabsTrigger value="configs" className="data-[state=active]:bg-primary/20">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="snippets" className="space-y-6">
            <Card className="neon-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Adicionar Novo Código
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createCodeSnippet} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={newSnippet.title}
                        onChange={(e) => setNewSnippet(prev => ({ ...prev, title: e.target.value }))}
                        className="neon-card border-primary/30"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Linguagem</Label>
                      <Select
                        value={newSnippet.language}
                        onValueChange={(value) => setNewSnippet(prev => ({ ...prev, language: value }))}
                      >
                        <SelectTrigger className="neon-card border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Dificuldade</Label>
                      <Select
                        value={newSnippet.difficulty}
                        onValueChange={(value) => setNewSnippet(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger className="neon-card border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Fácil</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="hard">Difícil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Código</Label>
                    <Textarea
                      id="content"
                      value={newSnippet.content}
                      onChange={(e) => setNewSnippet(prev => ({ ...prev, content: e.target.value }))}
                      className="neon-card border-primary/30 font-mono h-32"
                      placeholder="Digite o código aqui..."
                      required
                    />
                  </div>
                  <Button type="submit" className="hero-button">
                    Adicionar Código
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {codeSnippets.map((snippet) => (
                <Card key={snippet.id} className="neon-card border-primary/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{snippet.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-primary/20 px-2 py-1 rounded">
                          {snippet.language}
                        </span>
                        <span className="text-sm bg-accent/20 px-2 py-1 rounded">
                          {snippet.difficulty}
                        </span>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteCodeSnippet(snippet.id)}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-card/50 p-3 rounded text-sm overflow-x-auto">
                      <code>{snippet.content}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="configs" className="space-y-6">
            <div className="grid gap-6">
              <Card className="neon-card border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Configurações Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Nome do Site</Label>
                    <Input
                      id="site-name"
                      value={configs.site_name || ''}
                      onChange={(e) => updateConfig('site_name', e.target.value)}
                      className="neon-card border-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github-link">Link do GitHub</Label>
                    <Input
                      id="github-link"
                      value={configs.github_link || ''}
                      onChange={(e) => updateConfig('github_link', e.target.value)}
                      className="neon-card border-primary/30"
                      placeholder="https://github.com/seu-projeto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer-text">Texto do Rodapé</Label>
                    <Input
                      id="footer-text"
                      value={configs.footer_text || ''}
                      onChange={(e) => updateConfig('footer_text', e.target.value)}
                      className="neon-card border-primary/30"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="neon-card border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics & SEO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="google-analytics">Google Analytics ID</Label>
                    <Input
                      id="google-analytics"
                      value={configs.google_analytics || ''}
                      onChange={(e) => updateConfig('google_analytics', e.target.value)}
                      className="neon-card border-primary/30"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon-url">URL do Favicon</Label>
                    <Input
                      id="favicon-url"
                      value={configs.favicon_url || ''}
                      onChange={(e) => updateConfig('favicon_url', e.target.value)}
                      className="neon-card border-primary/30"
                      placeholder="https://exemplo.com/favicon.ico"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <Card className="neon-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Estatísticas de Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 neon-card">
                    <div className="text-2xl font-bold matrix-text mb-1">
                      {codeSnippets.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Códigos Cadastrados
                    </div>
                  </div>
                  <div className="text-center p-4 neon-card">
                    <div className="text-2xl font-bold matrix-text mb-1">
                      0
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Corridas Hoje
                    </div>
                  </div>
                  <div className="text-center p-4 neon-card">
                    <div className="text-2xl font-bold matrix-text mb-1">
                      0
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Usuários Registrados
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}