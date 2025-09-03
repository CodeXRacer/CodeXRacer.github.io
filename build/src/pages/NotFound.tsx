import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle } from "lucide-react";
import CodeRain from '@/components/CodeRain';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <CodeRain />
      <div className="relative z-10 text-center">
        <AlertTriangle className="w-20 h-20 text-primary mx-auto mb-6 animate-bounce-in" />
        <h1 className="text-6xl font-bold mb-4 matrix-text">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Esta página não foi encontrada no CodeRace
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="hero-button"
          size="lg"
        >
          <Home className="w-4 h-4 mr-2" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
