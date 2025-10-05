import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LoginProps {
  onSuccess: () => void;
}

const Login = ({ onSuccess }: LoginProps) => {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 800));

    if (usuario === 'Familia' && contraseña === 'viggo') {
      toast({
        title: "¡Bienvenida familia! 👨‍👩‍👧‍👦",
        description: "Acceso autorizado al calendario familiar"
      });
      onSuccess();
    } else {
      toast({
        title: "Credenciales incorrectas",
        description: "Usuario: Familia, Contraseña: viggo",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-apple">
        <CardHeader className="text-center space-y-2">
          <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
          <CardTitle className="text-2xl font-semibold">Calendario Familiar</CardTitle>
          <CardDescription>
            Inicia sesión para organizar las tareas familiares
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuario</Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Familia"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contraseña">Contraseña</Label>
              <Input
                id="contraseña"
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                placeholder="••••••"
                className="h-12"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base shadow-apple hover-lift"
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;