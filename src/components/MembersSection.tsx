import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Crown, 
  Award,
  TrendingUp,
  Star
} from 'lucide-react';
import { TareasPorDia, Miembro } from '@/types';

interface MembersSectionProps {
  tareas: TareasPorDia;
  miembroActivo: Miembro;
  onMiembroChange: (miembro: Miembro) => void;
}

const MembersSection = ({ tareas, miembroActivo, onMiembroChange }: MembersSectionProps) => {
  const todasLasTareas = Object.values(tareas).flat();
  
  const estadisticasPorMiembro = {
    mama: {
      total: todasLasTareas.filter(t => t.miembro === 'mama').length,
      completadas: todasLasTareas.filter(t => t.miembro === 'mama' && t.completada).length,
      valoracionPromedio: 0
    },
    papa: {
      total: todasLasTareas.filter(t => t.miembro === 'papa').length,
      completadas: todasLasTareas.filter(t => t.miembro === 'papa' && t.completada).length,
      valoracionPromedio: 0
    },
    ambos: {
      total: todasLasTareas.filter(t => t.miembro === 'ambos').length,
      completadas: todasLasTareas.filter(t => t.miembro === 'ambos' && t.completada).length,
      valoracionPromedio: 0
    }
  };

  // Calcular valoraciones promedio
  Object.keys(estadisticasPorMiembro).forEach(miembro => {
    const tareasConValoracion = todasLasTareas.filter(t => 
      t.miembro === miembro && t.valoracion
    );
    if (tareasConValoracion.length > 0) {
      const suma = tareasConValoracion.reduce((acc, t) => acc + (t.valoracion || 0), 0);
      estadisticasPorMiembro[miembro as Miembro].valoracionPromedio = 
        Math.round((suma / tareasConValoracion.length) * 10) / 10;
    }
  });

  const getMiembroInfo = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama':
        return {
          nombre: 'Mamá',
          icon: '👩',
          color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
          gradiente: 'from-pink-500 to-rose-500'
        };
      case 'papa':
        return {
          nombre: 'Papá',
          icon: '👨',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          gradiente: 'from-blue-500 to-cyan-500'
        };
      case 'ambos':
        return {
          nombre: 'Ambos',
          icon: '👨‍👩',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          gradiente: 'from-purple-500 to-indigo-500'
        };
    }
  };

  const obtenerMejorMiembro = () => {
    const porcentajes = Object.entries(estadisticasPorMiembro).map(([miembro, stats]) => ({
      miembro: miembro as Miembro,
      porcentaje: stats.total > 0 ? (stats.completadas / stats.total) * 100 : 0,
      valoracion: stats.valoracionPromedio
    }));

    return porcentajes.reduce((mejor, actual) => 
      actual.porcentaje > mejor.porcentaje ? actual : mejor
    );
  };

  const mejorMiembro = obtenerMejorMiembro();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Miembros de la Familia</h1>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="text-sm text-muted-foreground">
            Mejor del mes: {getMiembroInfo(mejorMiembro.miembro).icon} {getMiembroInfo(mejorMiembro.miembro).nombre}
          </span>
        </div>
      </div>

      {/* Selector de Miembro Activo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Miembro Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['mama', 'papa', 'ambos'] as Miembro[]).map((miembro) => {
              const info = getMiembroInfo(miembro);
              const isActivo = miembroActivo === miembro;
              
              return (
                <Button
                  key={miembro}
                  variant={isActivo ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => onMiembroChange(miembro)}
                  className={`h-16 justify-start gap-3 ${
                    isActivo ? `bg-gradient-to-r ${info.gradiente} text-white` : ''
                  }`}
                >
                  <span className="text-2xl">{info.icon}</span>
                  <div className="text-left">
                    <p className="font-medium">{info.nombre}</p>
                    <p className="text-xs opacity-70">
                      {estadisticasPorMiembro[miembro].completadas}/{estadisticasPorMiembro[miembro].total} completadas
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['mama', 'papa', 'ambos'] as Miembro[]).map((miembro) => {
          const info = getMiembroInfo(miembro);
          const stats = estadisticasPorMiembro[miembro];
          const porcentaje = stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0;
          const esMejor = mejorMiembro.miembro === miembro;
          
          return (
            <Card key={miembro} className={esMejor ? 'ring-2 ring-yellow-500' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{info.icon}</span>
                    <CardTitle>{info.nombre}</CardTitle>
                  </div>
                  {esMejor && (
                    <Crown className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progreso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completadas</span>
                    <span>{stats.completadas}/{stats.total}</span>
                  </div>
                  <Progress value={porcentaje} className="h-3" />
                  <p className="text-xs text-center text-muted-foreground">{porcentaje}%</p>
                </div>

                {/* Valoración */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Valoración promedio</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{stats.valoracionPromedio || 'N/A'}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={info.color}>
                    {stats.total} tareas asignadas
                  </Badge>
                  
                  {porcentaje >= 80 && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Award className="w-3 h-3 mr-1" />
                      Excelente
                    </Badge>
                  )}
                  
                  {stats.completadas > stats.total - stats.completadas && (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      En progreso
                    </Badge>
                  )}
                </div>

                {/* Tareas recientes */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Últimas tareas</h4>
                  <div className="space-y-1">
                    {todasLasTareas
                      .filter(t => t.miembro === miembro)
                      .slice(-3)
                      .map((tarea) => (
                        <div key={tarea.id} className="flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${
                            tarea.completada ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className={tarea.completada ? 'line-through text-muted-foreground' : ''}>
                            {tarea.texto}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MembersSection;