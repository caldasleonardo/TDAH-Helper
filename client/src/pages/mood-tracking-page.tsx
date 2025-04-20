import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useMoodTracking, 
  MoodType 
} from "@/hooks/use-mood-tracking";
import { MoodEmoji } from "@/components/mood/MoodEmoji";
import { MoodIntensitySlider } from "@/components/mood/MoodIntensitySlider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CalendarDays, BarChart, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function MoodTrackingPageContent() {
  const { user } = useAuth();
  const { 
    moods, 
    isLoadingMoods, 
    moodStats, 
    isLoadingStats,
    createMoodMutation, 
    deleteMoodMutation,
    activePeriod,
    setActivePeriod
  } = useMoodTracking();
  
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("registrar");
  
  const moodOptions: MoodType[] = [
    "happy", "calm", "sad", "angry", 
    "anxious", "tired", "energetic", "focused"
  ];
  
  const periodOptions = [
    { value: "day", label: "Hoje" },
    { value: "week", label: "Esta semana" },
    { value: "month", label: "Este mês" },
    { value: "year", label: "Este ano" },
  ];
  
  // Resetar seleção após envio bem-sucedido
  useEffect(() => {
    if (!createMoodMutation.isPending && isSubmitting) {
      setSelectedMood(null);
      setIntensity(3);
      setNote("");
      setIsSubmitting(false);
    }
  }, [createMoodMutation.isPending, isSubmitting]);
  
  const handleMoodSubmit = () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    
    createMoodMutation.mutate({
      mood: selectedMood,
      intensity,
      note: note.trim() || undefined,
      recordedAt: new Date().toISOString()
    });
  };
  
  const handleDeleteMood = (id: number) => {
    deleteMoodMutation.mutate(id);
  };
  
  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rastreamento de Humor</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registrar">Registrar Humor</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>
        
        {/* Tab: Registrar Humor */}
        <TabsContent value="registrar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Como você está se sentindo agora?</CardTitle>
              <CardDescription>
                Selecione o emoji que melhor representa seu humor atual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-4 gap-4 md:gap-6">
                {moodOptions.map((mood) => (
                  <MoodEmoji
                    key={mood}
                    mood={mood}
                    size="lg"
                    isSelected={selectedMood === mood}
                    onClick={() => setSelectedMood(mood)}
                  />
                ))}
              </div>
              
              {selectedMood && (
                <>
                  <MoodIntensitySlider
                    mood={selectedMood}
                    intensity={intensity}
                    onChange={setIntensity}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Observações (opcional):
                    </label>
                    <Textarea
                      placeholder="Adicione notas sobre como você está se sentindo..."
                      className="resize-none"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleMoodSubmit}
                    disabled={createMoodMutation.isPending}
                  >
                    {createMoodMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Registrar Humor"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab: Histórico */}
        <TabsContent value="historico">
          <Card className="min-h-[300px]">
            <CardHeader>
              <CardTitle>Histórico de Humor</CardTitle>
              <CardDescription>
                Visualize todos os seus registros de humor anteriores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMoods ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : moods.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Você ainda não tem registros de humor.</p>
                  <p>Comece registrando como você está se sentindo hoje!</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {moods.map((mood) => (
                      <div 
                        key={mood.id} 
                        className="flex items-start justify-between border rounded-lg p-3"
                      >
                        <div className="flex items-start gap-3">
                          <MoodEmoji 
                            mood={mood.mood as MoodType} 
                            intensity={mood.intensity}
                            size="sm"
                            animated={false}
                          />
                          <div>
                            <p className="font-medium">
                              {format(new Date(mood.recordedAt), "PPP 'às' p", { locale: pt })}
                            </p>
                            {mood.note && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {mood.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMood(mood.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tab: Estatísticas */}
        <TabsContent value="estatisticas">
          <Card className="min-h-[300px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Estatísticas de Humor</CardTitle>
                <CardDescription>
                  Análise dos seus padrões de humor ao longo do tempo
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>{periodOptions.find(p => p.value === activePeriod)?.label}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {periodOptions.map((period) => (
                    <DropdownMenuItem 
                      key={period.value}
                      onClick={() => setActivePeriod(period.value as any)}
                    >
                      {period.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !moodStats || moodStats.totalRecords === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Sem dados suficientes para gerar estatísticas.</p>
                  <p>Continue registrando seu humor diariamente!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Humores Predominantes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {moodStats.moodStats.slice(0, 4).map((stat) => (
                        <Card key={stat.mood}>
                          <CardContent className="p-4 flex flex-col items-center justify-center">
                            <MoodEmoji 
                              mood={stat.mood as MoodType} 
                              intensity={Math.round(stat.averageIntensity)}
                              size="md"
                              animated={false}
                            />
                            <div className="mt-2 text-center">
                              <p className="font-bold text-2xl">{Math.round(stat.percentage)}%</p>
                              <p className="text-xs text-muted-foreground">
                                {stat.count} registros
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  {/* Dados de tendência poderiam ser mostrados aqui com um gráfico */}
                  {moodStats.trendData.length > 1 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Tendências Recentes</h3>
                      <div className="h-60 bg-muted rounded-md flex items-center justify-center">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BarChart className="h-5 w-5" />
                          <span>Gráfico de tendências seria exibido aqui</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MoodTrackingPage() {
  // ProtectedRoute é usado no App.tsx para proteger essa página inteira,
  // não precisamos envolvê-la novamente aqui
  return (
    <MoodTrackingPageContent />
  );
}