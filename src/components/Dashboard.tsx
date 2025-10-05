import { useMemo, useState } from 'react';
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
  Star,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart
} from 'lucide-react';
import { Tarea, Miembro, EstadisticasMiembro } from '@/types';
import { MESES } from '@/lib/calendar-utils';
import { loadTareas } from '@/lib/storage';
import { 
  BarChart, 
  Bar, 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DashboardProps {
  currentMonth: number;
  currentYear: number;
  onSectionChange: (section: string) => void;
}

const COLORS = {
  mama: 'hsl(var(--chart-1))',
  papa: 'hsl(var(--chart-2))',
  ambos: 'hsl(var(--chart-3))',
  viggo: 'hsl(var(--chart-4))',
};

const Dashboard = ({ currentMonth, currentYear, onSectionChange }: DashboardProps) => {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const tareas = useMemo(() => {
    const allTareas = loadTareas();
    const tareasArray: Tarea[] = [];
    
    Object.entries(allTareas).forEach(([fecha, tareasList]) => {
      tareasList.forEach(tarea => {
        tareasArray.push({ ...tarea, fecha });
      });
    });
    
    return tareasArray.filter(t => {
      if (!t.fecha) return false;
      const [year, month] = t.fecha.split('-').map(Number);
      return year === selectedYear && month === selectedMonth + 1;
    });
  }, [selectedMonth, selectedYear]);

  const historialMeses = useMemo(() => {
    const allTareas = loadTareas();
    const tareasArray: Tarea[] = [];
    
    Object.entries(allTareas).forEach(([fecha, tareasList]) => {
      tareasList.forEach(tarea => {
        tareasArray.push({ ...tarea, fecha });
      });
    });

    const mesesData: { mes: string; completadas: number; pendientes: number; total: number }[] = [];
    const ahora = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const mes = fecha.getMonth();
      const año = fecha.getFullYear();
      
      const tareasMes = tareasArray.filter(t => {
        if (!t.fecha) return false;
        const [year, month] = t.fecha.split('-').map(Number);
        return year === año && month === mes + 1;
      });
      
      mesesData.push({
        mes: `${MESES[mes].substring(0, 3)}`,
        completadas: tareasMes.filter(t => t.completada).length,
        pendientes: tareasMes.filter(t => !t.completada).length,
        total: tareasMes.length
      });
    }
    
    return mesesData;
  }, []);

  const estadisticas = useMemo(() => {
    const completadas = tareas.filter(t => t.completada);
    const pendientes = tareas.filter(t => !t.completada);

    const estadisticasPorMiembro: Record<Miembro, EstadisticasMiembro> = {
      mama: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
      papa: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
      ambos: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
      viggo: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
    };

    tareas.forEach(tarea => {
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

    const datosPorCategoria = tareas.reduce((acc, tarea) => {
      const categoria = tarea.categoria || 'Sin categoría';
      if (!acc[categoria]) {
        acc[categoria] = { total: 0, completadas: 0 };
      }
      acc[categoria].total++;
      if (tarea.completada) {
        acc[categoria].completadas++;
      }
      return acc;
    }, {} as Record<string, { total: number; completadas: number }>);

    return {
      total: tareas.length,
      completadas: completadas.length,
      pendientes: pendientes.length,
      porcentajeCompletado: tareas.length > 0 ? Math.round((completadas.length / tareas.length) * 100) : 0,
      estadisticasPorMiembro,
      tareasRecientes: completadas.slice(-5).reverse(),
      tareasPendientesUrgentes: pendientes.slice(0, 5),
      datosPorCategoria
    };
  }, [tareas]);

  const chartDataMiembros = useMemo(() => {
    return Object.entries(estadisticas.estadisticasPorMiembro)
      .filter(([_, stats]) => stats.total > 0)
      .map(([miembro, stats]) => ({
        miembro: miembro.charAt(0).toUpperCase() + miembro.slice(1),
        completadas: stats.completadas,
        pendientes: stats.pendientes,
        total: stats.total
      }));
  }, [estadisticas.estadisticasPorMiembro]);

  const chartDataCategorias = useMemo(() => {
    return Object.entries(estadisticas.datosPorCategoria)
      .map(([categoria, data]) => ({
        name: categoria,
        value: data.total,
        completadas: data.completadas
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [estadisticas.datosPorCategoria]);

  const cambiarMes = (direccion: number) => {
    let nuevoMes = selectedMonth + direccion;
    let nuevoAño = selectedYear;
    
    if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAño++;
    } else if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAño--;
    }
    
    setSelectedMonth(nuevoMes);
    setSelectedYear(nuevoAño);
  };

  const getMiembroIcon = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama': return '👩';
      case 'papa': return '👨';
      case 'ambos': return '👨‍👩';
      case 'viggo': return '👶';
    }
  };

  const getMiembroColor = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'papa': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ambos': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'viggo': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-3 mt-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => cambiarMes(-1)}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-muted-foreground font-medium min-w-[140px] text-center">
              {MESES[selectedMonth]} {selectedYear}
            </p>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => cambiarMes(1)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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

      {/* Gráfico de Historial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Historial de Tareas (Últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              completadas: {
                label: "Completadas",
                color: "hsl(var(--chart-1))",
              },
              pendientes: {
                label: "Pendientes",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historialMeses}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="mes" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completadas" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  name="Completadas"
                />
                <Line 
                  type="monotone" 
                  dataKey="pendientes" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Pendientes"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico por Miembro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tareas por Miembro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                completadas: {
                  label: "Completadas",
                  color: "hsl(var(--chart-1))",
                },
                pendientes: {
                  label: "Pendientes",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataMiembros}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="miembro" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="completadas" fill="hsl(var(--chart-1))" name="Completadas" />
                  <Bar dataKey="pendientes" fill="hsl(var(--chart-2))" name="Pendientes" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Top 5 Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartDataCategorias.length > 0 ? (
              <ChartContainer
                config={{
                  value: {
                    label: "Tareas",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={chartDataCategorias}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="hsl(var(--chart-1))"
                      dataKey="value"
                    >
                      {chartDataCategorias.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RechartsPie>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-center py-20">
                No hay datos de categorías
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas por Miembro */}
      <Card>
        <CardHeader>
          <CardTitle>Reparto de Tareas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(estadisticas.estadisticasPorMiembro)
              .filter(([_, stats]) => stats.total > 0)
              .map(([miembro, stats]) => (
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