import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSubscription } from "@/hooks/use-subscription";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { LockIcon, TimerIcon, PlayIcon, PauseIcon, RotateCcwIcon, SettingsIcon, AlertCircleIcon, Volume2Icon, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Definição dos presets para diferentes tipos de TDAH
const presets = {
  mild: {
    workTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    sessionsBeforeLongBreak: 4,
    visualAlerts: true,
    soundAlerts: true
  },
  moderate: {
    workTime: 20,
    breakTime: 7,
    longBreakTime: 20,
    sessionsBeforeLongBreak: 3,
    visualAlerts: true,
    soundAlerts: true
  },
  severe: {
    workTime: 15,
    breakTime: 8,
    longBreakTime: 20,
    sessionsBeforeLongBreak: 2,
    visualAlerts: true,
    soundAlerts: true
  },
  custom: {
    workTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    sessionsBeforeLongBreak: 4,
    visualAlerts: true,
    soundAlerts: true
  }
};

// Tipos de tarefas
const taskTypes = [
  { value: "focusIntensive", label: "Alta Concentração", description: "Tarefas que exigem foco intenso, como leitura ou escrita" },
  { value: "creative", label: "Criativa", description: "Tarefas que envolvem criatividade e brainstorming" },
  { value: "administrative", label: "Administrativa", description: "Tarefas rotineiras como email ou organização" },
  { value: "learning", label: "Aprendizado", description: "Estudos ou aquisição de novos conhecimentos" }
];

export default function PomodoroTool() {
  const [, navigate] = useLocation();
  const { isPremium, isLoadingUserFeatures } = useSubscription();
  const { toast } = useToast();
  
  // Estados para o timer
  const [selectedPreset, setSelectedPreset] = useState<string>("mild");
  const [taskType, setTaskType] = useState<string>("focusIntensive");
  const [settings, setSettings] = useState(presets.mild);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.workTime * 60);
  const [sessions, setSessions] = useState(0);
  const [activeTab, setActiveTab] = useState("timer");
  
  // Configurações personalizadas
  const [customSettings, setCustomSettings] = useState(presets.custom);
  
  // Formatar tempo para MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calcular progresso em porcentagem
  const calculateProgress = () => {
    const totalTime = isBreak 
      ? (isLongBreak ? settings.longBreakTime * 60 : settings.breakTime * 60) 
      : settings.workTime * 60;
    return 100 - ((timeLeft / totalTime) * 100);
  };
  
  // Efeito para manipulação do timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval as NodeJS.Timeout);
            
            // Mostrar notificação
            if (isBreak) {
              toast({
                title: isLongBreak ? "Intervalo longo concluído!" : "Intervalo concluído!",
                description: "Hora de voltar ao trabalho.",
                variant: "default"
              });
              
              // Voltar para trabalho
              setIsBreak(false);
              setIsLongBreak(false);
              return settings.workTime * 60;
            } else {
              // Incrementar sessão
              const newSessions = sessions + 1;
              setSessions(newSessions);
              
              // Verificar se deve começar um intervalo longo
              if (newSessions % settings.sessionsBeforeLongBreak === 0) {
                setIsLongBreak(true);
                setIsBreak(true);
                
                toast({
                  title: "Sessão de trabalho concluída!",
                  description: "Hora de um intervalo longo. Descanse bem!",
                  variant: "default"
                });
                
                return settings.longBreakTime * 60;
              } else {
                setIsBreak(true);
                
                toast({
                  title: "Sessão de trabalho concluída!",
                  description: "Hora de um breve intervalo.",
                  variant: "default"
                });
                
                return settings.breakTime * 60;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isBreak, isLongBreak, sessions, settings, toast]);
  
  // Efeito para atualizar configurações quando o preset muda
  useEffect(() => {
    if (selectedPreset === "custom") {
      setSettings(customSettings);
    } else {
      setSettings(presets[selectedPreset as keyof typeof presets]);
    }
    
    // Resetar o timer quando as configurações mudam
    if (isRunning) {
      setIsRunning(false);
    }
    
    setIsBreak(false);
    setIsLongBreak(false);
    setSessions(0);
    
    // Definir o tempo baseado no tipo de tarefa selecionada
    let adjustedTime = presets[selectedPreset as keyof typeof presets].workTime;
    
    if (taskType === "focusIntensive") {
      // Para tarefas de foco intenso, reduz ligeiramente o tempo de trabalho
      adjustedTime = Math.max(adjustedTime - 5, 10);
    } else if (taskType === "creative") {
      // Para tarefas criativas, aumenta o tempo de trabalho
      adjustedTime = adjustedTime + 5;
    }
    
    setTimeLeft(adjustedTime * 60);
  }, [selectedPreset, taskType, customSettings]);
  
  // Função para iniciar/pausar o timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };
  
  // Função para resetar o timer
  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setIsLongBreak(false);
    setSessions(0);
    setTimeLeft(settings.workTime * 60);
  };
  
  // Função para atualizar configurações personalizadas
  const updateCustomSettings = (key: keyof typeof customSettings, value: any) => {
    setCustomSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (selectedPreset === "custom") {
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      // Resetar o timer se necessário
      if (key === "workTime" && !isBreak) {
        setTimeLeft(value * 60);
      } else if (key === "breakTime" && isBreak && !isLongBreak) {
        setTimeLeft(value * 60);
      } else if (key === "longBreakTime" && isBreak && isLongBreak) {
        setTimeLeft(value * 60);
      }
    }
  };
  
  // Se estiver carregando, mostra indicador de carregamento
  if (isLoadingUserFeatures) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-neutral-500">Carregando ferramenta...</p>
      </div>
    );
  }
  
  // Se não for premium, mostra tela de acesso negado
  if (!isPremium) {
    return (
      <div className="container mx-auto p-4 mb-20">
        <Header />
        <div className="my-10 flex flex-col items-center text-center">
          <div className="bg-primary/5 p-8 rounded-lg border border-primary/20 max-w-2xl">
            <LockIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ferramenta Premium Bloqueada</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Esta ferramenta avançada está disponível apenas para assinantes premium. Faça o upgrade para desbloquear todas as funcionalidades.
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              size="lg"
              onClick={() => navigate("/subscribe")}
            >
              Assinar Premium
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 mb-20">
      <Header />
      
      <div className="my-4">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate("/premium-content")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Conteúdo Premium
        </Button>
        
        <div className="flex items-center mb-6">
          <TimerIcon className="h-7 w-7 text-primary mr-3" />
          <h1 className="text-2xl font-bold">Pomodoro Adaptado para TDAH</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timer" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {isBreak 
                      ? (isLongBreak ? "Intervalo Longo" : "Intervalo") 
                      : "Tempo de Trabalho"
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative w-56 h-56 flex items-center justify-center mb-6">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-neutral-200 dark:text-neutral-800" 
                        strokeWidth="4" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="45" 
                        cx="50" 
                        cy="50" 
                      />
                      <circle 
                        className="text-primary" 
                        strokeWidth="4" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="45" 
                        cx="50" 
                        cy="50" 
                        strokeDasharray="282.7"
                        strokeDashoffset={282.7 - (calculateProgress() / 100) * 282.7}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
                      <span className="text-sm text-neutral-500 mt-2">
                        {isBreak 
                          ? (isLongBreak ? "Intervalo Longo" : "Intervalo") 
                          : "Foco"
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mb-6">
                    <Button 
                      size="lg" 
                      className={isRunning ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}
                      onClick={toggleTimer}
                    >
                      {isRunning 
                        ? <><PauseIcon className="h-5 w-5 mr-2" /> Pausar</> 
                        : <><PlayIcon className="h-5 w-5 mr-2" /> Iniciar</>
                      }
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={resetTimer}
                    >
                      <RotateCcwIcon className="h-5 w-5 mr-1" /> Reiniciar
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                    <span>Sessões concluídas: {sessions}</span>
                    {sessions > 0 && <span> | </span>}
                    {sessions > 0 && <span>Próximo intervalo longo: {settings.sessionsBeforeLongBreak - (sessions % settings.sessionsBeforeLongBreak)} sessões</span>}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Configuração Rápida</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="tdah-preset">Tipo de TDAH:</Label>
                      <Select 
                        value={selectedPreset} 
                        onValueChange={(value) => {
                          setSelectedPreset(value);
                          resetTimer();
                        }}
                      >
                        <SelectTrigger id="tdah-preset">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Leve</SelectItem>
                          <SelectItem value="moderate">Moderado</SelectItem>
                          <SelectItem value="severe">Severo</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="task-type">Tipo de Tarefa:</Label>
                      <Select 
                        value={taskType} 
                        onValueChange={(value) => {
                          setTaskType(value);
                          resetTimer();
                        }}
                      >
                        <SelectTrigger id="task-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {taskTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <p className="text-sm text-neutral-500 mt-1">
                        {taskTypes.find(t => t.value === taskType)?.description}
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Volume2Icon className="h-4 w-4 text-neutral-500" />
                          <Label htmlFor="sound-toggle">Som de alerta</Label>
                        </div>
                        <Switch 
                          id="sound-toggle" 
                          checked={settings.soundAlerts}
                          onCheckedChange={(checked) => {
                            if (selectedPreset === "custom") {
                              updateCustomSettings("soundAlerts", checked);
                            } else {
                              setSettings({...settings, soundAlerts: checked});
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4">
              <div className="flex">
                <AlertCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Dica para TDAH</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Comece com sessões curtas de foco e aumente gradualmente conforme sua capacidade de concentração melhora. Os intervalos são essenciais para seu cérebro se recuperar - não pule eles!
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Configurações Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="work-time">Tempo de Trabalho (minutos): {customSettings.workTime}</Label>
                    </div>
                    <Slider 
                      id="work-time"
                      min={5}
                      max={45}
                      step={5}
                      value={[customSettings.workTime]}
                      onValueChange={(value) => updateCustomSettings("workTime", value[0])}
                      className="mb-2"
                    />
                    <p className="text-sm text-neutral-500">
                      Período de foco intenso. Recomendado: 15-25 min para TDAH.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="break-time">Tempo de Intervalo (minutos): {customSettings.breakTime}</Label>
                    </div>
                    <Slider 
                      id="break-time"
                      min={3}
                      max={15}
                      step={1}
                      value={[customSettings.breakTime]}
                      onValueChange={(value) => updateCustomSettings("breakTime", value[0])}
                      className="mb-2"
                    />
                    <p className="text-sm text-neutral-500">
                      Breve pausa entre sessões de trabalho.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="long-break-time">Tempo de Intervalo Longo (minutos): {customSettings.longBreakTime}</Label>
                    </div>
                    <Slider 
                      id="long-break-time"
                      min={10}
                      max={30}
                      step={5}
                      value={[customSettings.longBreakTime]}
                      onValueChange={(value) => updateCustomSettings("longBreakTime", value[0])}
                      className="mb-2"
                    />
                    <p className="text-sm text-neutral-500">
                      Pausa estendida após múltiplas sessões de trabalho.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="sessions-before-long-break">Sessões até Intervalo Longo: {customSettings.sessionsBeforeLongBreak}</Label>
                    </div>
                    <Slider 
                      id="sessions-before-long-break"
                      min={1}
                      max={6}
                      step={1}
                      value={[customSettings.sessionsBeforeLongBreak]}
                      onValueChange={(value) => updateCustomSettings("sessionsBeforeLongBreak", value[0])}
                      className="mb-2"
                    />
                    <p className="text-sm text-neutral-500">
                      Quantas sessões de trabalho antes de um intervalo longo.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setSelectedPreset("custom");
                      setSettings(customSettings);
                      resetTimer();
                      setActiveTab("timer");
                      toast({
                        title: "Configurações atualizadas",
                        description: "Suas configurações personalizadas foram aplicadas."
                      });
                    }}
                  >
                    Aplicar Configurações
                  </Button>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                  <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Dicas de Personalização para TDAH</h3>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    <li>• TDAH severo: prefira sessões mais curtas (10-15 min) com pausas mais frequentes</li>
                    <li>• TDAH moderado: experimente sessões de 15-20 min com bons intervalos</li>
                    <li>• TDAH leve: pode tentar sessões de 20-25 min mantendo pausas adequadas</li>
                    <li>• Para tarefas difíceis, reduza a duração das sessões em 5 minutos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
}