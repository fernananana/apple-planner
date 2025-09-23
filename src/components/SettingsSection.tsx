import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Settings, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  LogOut,
  Bell,
  Palette,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useStore } from '@/store/useStore';

interface SettingsSectionProps {
  onLogout: () => void;
}

const SettingsSection = ({ onLogout }: SettingsSectionProps) => {
  const { tareas, sugeridas, setTareas, setSugeridas } = useStore((state) => ({
    tareas: state.tareas,
    sugeridas: state.sugeridas,
    setTareas: state.setTareas,
    setSugeridas: state.setSugeridas,
  }));
  const { toast } = useToast();
  const [emails, setEmails] = useState<string[]>(['']);
  const [tema, setTema] = useState('system');
  const [vistaDefault, setVistaDefault] = useState('mensual');
  const [mostrarFines, setMostrarFines] = useState(true);
  const [semanaLunes, setSemanaLunes] = useState(true);
  const [zonaHoraria, setZonaHoraria] = useState('madrid');

  const exportarDatos = () => {
    const datos = {
      tareas,
      sugeridas,
      fechaExportacion: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(datos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendario-familiar-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Datos exportados",
      description: "Los datos se han descargado correctamente"
    });
  };

  const importarDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const datos = JSON.parse(e.target?.result as string);
        
        if (datos.tareas) {
          setTareas(datos.tareas);
        }
        if (datos.sugeridas) {
          setSugeridas(datos.sugeridas);
        }
        
        toast({
          title: "Datos importados",
          description: "Los datos se han importado correctamente"
        });
      } catch (error) {
        toast({
          title: "Error al importar",
          description: "El archivo no es válido",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const borrarTodosDatos = () => {
    setTareas([]);
    setSugeridas([]);
    
    toast({
      title: "Datos borrados",
      description: "Todos los datos han sido eliminados"
    });
  };

  const agregarEmail = () => {
    setEmails([...emails, '']);
  };

  const actualizarEmail = (index: number, email: string) => {
    const newEmails = [...emails];
    newEmails[index] = email;
    setEmails(newEmails);
  };

  const eliminarEmail = (index: number) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>

      {/* Gestión de Datos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Gestión de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={exportarDatos} className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Datos
            </Button>
            
            <div>
              <input
                type="file"
                accept=".json"
                onChange={importarDatos}
                style={{ display: 'none' }}
                id="import-file"
              />
              <Button 
                onClick={() => document.getElementById('import-file')?.click()}
                variant="outline"
                className="gap-2 w-full"
              >
                <Upload className="w-4 h-4" />
                Importar Datos
              </Button>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Borrar Todos los Datos
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Borrar todos los datos?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todas las tareas y configuraciones. 
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={borrarTodosDatos} className="bg-destructive">
                    Borrar Todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Correos electrónicos para notificaciones</Label>
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => actualizarEmail(index, e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="flex-1"
                  />
                  {emails.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarEmail(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={agregarEmail}
                className="w-full"
              >
                + Agregar otro correo
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-tareas">Recordatorios de tareas</Label>
            <Switch id="notif-tareas" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-completadas">Notificar tareas completadas</Label>
            <Switch id="notif-completadas" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-resumen">Resumen diario</Label>
            <Switch id="notif-resumen" />
          </div>
        </CardContent>
      </Card>

      {/* Apariencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tema">Tema</Label>
            <Select value={tema} onValueChange={setTema}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vista-default">Vista por defecto</Label>
            <Select value={vistaDefault} onValueChange={setVistaDefault}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                <SelectItem value="diaria">Diaria</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensual">Mensual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Configuración del Calendario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="mostrar-fines">Mostrar fines de semana</Label>
            <Switch 
              id="mostrar-fines" 
              checked={mostrarFines}
              onCheckedChange={setMostrarFines}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="semana-lunes">Semana comienza en lunes</Label>
            <Switch 
              id="semana-lunes" 
              checked={semanaLunes}
              onCheckedChange={setSemanaLunes}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zona-horaria">Zona horaria</Label>
            <Select value={zonaHoraria} onValueChange={setZonaHoraria}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border z-50">
                <SelectItem value="madrid">Madrid (GMT+1)</SelectItem>
                <SelectItem value="canarias">Canarias (GMT+0)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Información de la App */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Aplicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Versión:</strong> 1.0.0</p>
          <p><strong>Tareas totales:</strong> {tareas.length}</p>
          <p><strong>Sugeridas:</strong> {sugeridas.length}</p>
          <p><strong>Última actualización:</strong> {new Date().toLocaleDateString()}</p>
        </CardContent>
      </Card>

      {/* Cerrar Sesión */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="w-full gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;