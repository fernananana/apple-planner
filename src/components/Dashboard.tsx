import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users,
  Calendar as CalendarIcon,
  Star
} from 'lucide-react';
import { Tarea, TareasPorDia, Miembro, EstadisticasMiembro } from '@/types';
import { MESES } from '@/lib/calendar-utils';

interface DashboardProps {
  tareas: TareasPorDia;
  currentMonth: number;
  currentYear: number;
  onSectionChange: (section: string) => void;
}

const Dashboard = ({ tareas, currentMonth, currentYear, onSectionChange }: DashboardProps) => {
  const estadisticas = useMemo(() => {
    const todasLasTareas: Tarea[] = Object.values(tareas).flat();
    const completadas = todasLasTareas.filter(t => t.completada);
    const pendientes = todasLasTareas.filter(t => !t.completada);

    const estadisticasPorMiembro: Record<Miembro, EstadisticasMiembro> = {
      mama: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
      papa: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
      ambos: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
      viggo: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
    };

    todasLasTareas.forEach(tarea => {
      estadisticasPorMiembro[tarea.miembro].total++;
      if (tarea.completada) {
        estadisticasPorMiembro[tarea.miembro].completadas++;
      } else {
        estadisticasPorMiembro[tarea.miembro].pendientes++;
      }
    });

    Object.keys(estadisticasPorMiembro).forEach(miembro => {
      const stats = estadisticasPorMiembro[miembro as Miembro];
      stats.porcentaje = stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0;
    });

    return {
      total: todasLasTareas.length,
      completadas: completadas.length,
      pendientes: pendientes.length,
      porcentajeCompletado: todasLasTareas.length > 0 ? Math.round((completadas.length / todasLasTareas.length) * 100) : 0,
      estadisticasPorMiembro,
      tareasRecientes: completadas.slice(-5).reverse(),
      tareasPendientesUrgentes: pendientes.slice(0, 5)
    };
  }, [tareas]);

  const getMiembroIcon = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama': return '👩';
      case 'papa': return '👨';
      case 'viggo': return '🧒';
      case 'ambos': return '👨‍👩';
    }
  };

  const getMiembroColor = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'papa': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viggo': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ambos': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{MESES[currentMonth]} {currentYear}</p>
        </div>
        <Button onClick={() => onSectionChange('calendar')} className="gap-2">
          <CalendarIcon className="w-4 h-4" />
          Ver Calendario
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{estadisticas.completadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{estadisticas.pendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Progreso</p>
                <p className="text-2xl font-bold">{estadisticas.porcentajeCompletado}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{estadisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso General */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Tareas completadas</span>
              <span>{estadisticas.completadas} de {estadisticas.total}</span>
            </div>
            <Progress value={estadisticas.porcentajeCompletado} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas por Miembro */}
      <Card>
        <CardHeader>
          <CardTitle>Reparto de Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(estadisticas.estadisticasPorMiembro).map(([miembro, stats]) => (
              <div key={miembro} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getMiembroIcon(miembro as Miembro)}</span>
                  <span className="font-medium capitalize">{miembro}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completadas</span>
                    <span>{stats.completadas}/{stats.total}</span>
                  </div>
                  <Progress value={stats.porcentaje} className="h-2" />
                  <p className="text-xs text-muted-foreground">{stats.porcentaje}% completado</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas Pendientes Urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Tareas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estadisticas.tareasPendientesUrgentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  ¡Genial! No hay tareas pendientes
                </p>
              ) : (
                estadisticas.tareasPendientesUrgentes.map((tarea) => (
                  <div key={tarea.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{tarea.texto}</p>
                      {tarea.notas && (
                        <p className="text-sm text-muted-foreground">{tarea.notas}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={getMiembroColor(tarea.miembro)}>
                      {getMiembroIcon(tarea.miembro)} {tarea.miembro}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tareas Completadas Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completadas Recientemente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estadisticas.tareasRecientes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aún no hay tareas completadas
                </p>
              ) : (
                estadisticas.tareasRecientes.map((tarea) => (
                  <div key={tarea.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="flex-1">
                      <p className="font-medium">{tarea.texto}</p>
                      {tarea.valoracion && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: tarea.valoracion }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={getMiembroColor(tarea.miembro)}>
                      {getMiembroIcon(tarea.miembro)} {tarea.miembro}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;