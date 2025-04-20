import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartPieIcon, 
  UserIcon, 
  BookIcon, 
  CalendarCheckIcon, 
  UsersIcon, 
  DownloadIcon, 
  BrainIcon, 
  ActivityIcon, 
  Lightbulb, 
  CheckCircle, 
  BarChart3Icon, 
  FileText, 
  ArrowLeft
} from "lucide-react";
import { interpretations } from "@/lib/quiz-data";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";

// Tipo para dados detalhados do relatório
type DetailedReportSection = {
  title: string;
  description: string;
  score: number;
  maxScore: number;
  insights: string[];
  recommendations: {
    text: string;
    type: "lifestyle" | "medical" | "educational" | "professional";
  }[];
  resources: {
    title: string;
    description: string;
    url?: string;
  }[];
};

export default function DetailedReportPage() {
  const [, params] = useRoute("/detailed-report/:id");
  const resultId = params?.id;
  const { user } = useAuth();
  
  // Consulta o resultado do quiz e verifica acesso premium
  const { data: result, isLoading, error } = useQuery({
    queryKey: [`/api/quiz-results/${resultId}`],
    enabled: !!resultId,
    select: (data) => {
      // Parse the answers JSON string to object if it exists
      if (data && typeof data.answers === 'string') {
        try {
          return {
            ...data,
            answers: JSON.parse(data.answers)
          };
        } catch (e) {
          console.error("Error parsing answers:", e);
        }
      }
      return data;
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-center mb-6">
                  <Skeleton className="h-24 w-24 rounded-full" />
                </div>
                <Skeleton className="h-8 w-40 mx-auto mb-2" />
                <Skeleton className="h-4 w-full mb-6" />
                <Skeleton className="h-32 w-full mb-6" />
                <Skeleton className="h-40 w-full mb-6" />
              </CardContent>
            </Card>
          </div>
        </main>
        
        <BottomNav />
      </div>
    );
  }
  
  if (error || !result) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-center mb-4">Erro ao carregar relatório</h2>
                <p className="text-neutral-600 dark:text-neutral-300 text-center mb-6">
                  Não foi possível carregar seu relatório detalhado. Por favor, tente novamente.
                </p>
                <Link href={`/results/${resultId}`}>
                  <Button className="w-full">Voltar para o resultado</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <BottomNav />
      </div>
    );
  }
  
  // Verifica se o usuário pagou pelo relatório premium
  if (!result.premiumPaid) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold mb-4">Conteúdo Premium</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Este relatório detalhado está disponível para compra.
                </p>
                <div className="flex flex-col space-y-3">
                  <Link href={`/checkout/${resultId}`}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Adquirir relatório detalhado
                    </Button>
                  </Link>
                  <Link href={`/results/${resultId}`}>
                    <Button variant="outline" className="w-full">
                      Voltar para o resultado básico
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <BottomNav />
      </div>
    );
  }
  
  // Mock de dados detalhados para o relatório (seriam substituídos pelos dados reais do backend)
  const category = result.category || "moderate";
  const interpretation = interpretations[category as keyof typeof interpretations];
  
  // Cálculo das porcentagens para cada área
  const calculatePercentage = (score: number, maxPossible: number) => {
    return (score / maxPossible) * 100;
  };
  
  const inattentionPercent = calculatePercentage(result.inattentionScore || 0, 27);
  const hyperactivityPercent = calculatePercentage(result.hyperactivityScore || 0, 9);
  const impulsivityPercent = calculatePercentage(result.impulsivityScore || 0, 15);
  
  // Determinar o nível de cada área
  const getLevel = (percent: number) => {
    if (percent < 33) return { level: 'baixo', color: 'bg-green-500', className: 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30' };
    if (percent < 66) return { level: 'médio', color: 'bg-amber-500', className: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30' };
    return { level: 'alto', color: 'bg-red-500', className: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30' };
  };
  
  const inattentionLevel = getLevel(inattentionPercent);
  const hyperactivityLevel = getLevel(hyperactivityPercent);
  const impulsivityLevel = getLevel(impulsivityPercent);
  
  // Dados detalhados para cada seção
  const detailedData: Record<string, DetailedReportSection> = {
    inattention: {
      title: "Desatenção",
      description: "A desatenção se caracteriza pela dificuldade em manter o foco, organizar tarefas e seguir instruções detalhadas. Pessoas com esse padrão frequentemente se distraem facilmente e apresentam esquecimentos em atividades diárias.",
      score: result.inattentionScore || 0,
      maxScore: 27,
      insights: [
        "Você apresentou indicadores significativos em perda de foco durante atividades que exigem atenção prolongada",
        "Há dificuldade em organizar tarefas e atividades de forma consistente",
        "Tendência a evitar tarefas que exigem esforço mental sustentado",
        "Distrações com estímulos externos ocorrem com frequência",
        "Esquecimentos em atividades cotidianas são recorrentes"
      ],
      recommendations: [
        {
          text: "Utilize técnicas de gerenciamento de tempo como Pomodoro (ciclos de foco e pausa)",
          type: "lifestyle"
        },
        {
          text: "Desenvolva sistemas de organização pessoal com lembretes visuais e alarmes",
          type: "lifestyle"
        },
        {
          text: "Pratique exercícios de atenção plena (mindfulness) diariamente por 10 minutos",
          type: "lifestyle"
        },
        {
          text: "Considere uma avaliação neuropsicológica completa para entender seu perfil atencional",
          type: "medical"
        },
        {
          text: "Experimente técnicas de estudo ativas como mapas mentais e resumos escritos",
          type: "educational"
        }
      ],
      resources: [
        {
          title: "Técnicas de Concentração",
          description: "Guia prático com exercícios para melhorar o foco e a concentração"
        },
        {
          title: "Aplicativos de Gerenciamento",
          description: "Ferramentas digitais para organizar tarefas e definir lembretes"
        },
        {
          title: "Mindfulness para TDAH",
          description: "Programa de atenção plena adaptado para pessoas com dificuldades de atenção"
        }
      ]
    },
    hyperactivity: {
      title: "Hiperatividade",
      description: "A hiperatividade manifesta-se como inquietação física e mental excessivas. Inclui dificuldade em permanecer sentado, sensação constante de estar 'ligado' e fala excessiva ou acelerada.",
      score: result.hyperactivityScore || 0,
      maxScore: 9,
      insights: [
        "Você apresenta inquietação física constante, como dificuldade em ficar sentado",
        "Há relatos de sensação interna de agitação ou estar 'a todo vapor'",
        "Tendência a falar excessivamente ou de forma acelerada em situações sociais",
        "Dificuldade em realizar atividades de lazer tranquilamente",
        "Propensão a interromper conversas ou ter impaciência em filas e esperas"
      ],
      recommendations: [
        {
          text: "Incorpore exercícios físicos regulares de intensidade moderada a alta na rotina diária",
          type: "lifestyle"
        },
        {
          text: "Utilize objetos manipuláveis (fidget toys) durante reuniões ou momentos que exigem ficar parado",
          type: "lifestyle"
        },
        {
          text: "Pratique técnicas de respiração profunda e relaxamento muscular progressivo",
          type: "lifestyle"
        },
        {
          text: "Discuta com profissional de saúde sobre técnicas comportamentais específicas",
          type: "medical"
        },
        {
          text: "Adapte seu ambiente de trabalho para permitir movimento (mesa em pé, bola como cadeira)",
          type: "professional"
        }
      ],
      resources: [
        {
          title: "Exercícios para Canalizar Energia",
          description: "Programa de atividades físicas adaptadas para pessoas com hiperatividade"
        },
        {
          title: "Técnicas de Autoregulação",
          description: "Métodos práticos para gerenciar inquietação em ambientes sociais e profissionais"
        },
        {
          title: "Adaptações no Ambiente",
          description: "Modificações em espaços de trabalho e estudo para acomodar necessidades de movimento"
        }
      ]
    },
    impulsivity: {
      title: "Impulsividade",
      description: "A impulsividade caracteriza-se por ações precipitadas sem consideração adequada das consequências. Inclui interrupções frequentes, respostas impulsivas e tomada de decisões sem planejamento prévio.",
      score: result.impulsivityScore || 0,
      maxScore: 15,
      insights: [
        "Você apresenta tendência a reagir sem refletir adequadamente sobre as consequências",
        "Há dificuldade em aguardar sua vez em conversas e atividades",
        "Interrupção frequente das falas de outras pessoas foi relatada",
        "Padrão de tomar decisões importantes rapidamente, sem planejamento adequado",
        "Propensão a iniciar projetos ou relações sem consideração completa das implicações"
      ],
      recommendations: [
        {
          text: "Implemente a regra dos 5 minutos: aguarde este tempo antes de tomar decisões não urgentes",
          type: "lifestyle"
        },
        {
          text: "Pratique técnicas de consciência da respiração em momentos de impulso",
          type: "lifestyle"
        },
        {
          text: "Desenvolva o hábito de fazer listas de prós e contras antes de decisões importantes",
          type: "lifestyle"
        },
        {
          text: "Considere terapia cognitivo-comportamental focada no controle de impulsos",
          type: "medical"
        },
        {
          text: "Estabeleça um sistema de feedback com pessoas próximas sobre comportamentos impulsivos",
          type: "professional"
        }
      ],
      resources: [
        {
          title: "Treinamento em Controle de Impulsos",
          description: "Programa passo a passo para desenvolver autocontrole em diferentes situações"
        },
        {
          title: "Diário de Decisões",
          description: "Template para registro e análise de processos decisórios"
        },
        {
          title: "Comunicação Assertiva",
          description: "Técnicas para expressar-se de forma eficaz sem interrupções ou impulsividade"
        }
      ]
    }
  };
  
  // Gerar um plano de ação consolidado
  const actionPlan = {
    immediate: [
      "Implementar sistema de organização visual com post-its ou quadros",
      "Iniciar prática diária de 10 minutos de mindfulness",
      "Estabelecer rotina de exercícios físicos 3x por semana"
    ],
    shortTerm: [
      "Agendar consulta com profissional especializado em TDAH",
      "Adaptar espaço de trabalho/estudo para minimizar distrações",
      "Começar a utilizar aplicativo de gerenciamento de tempo"
    ],
    longTerm: [
      "Desenvolver estratégias personalizadas baseadas na avaliação profissional",
      "Estabelecer rede de apoio com pessoas próximas",
      "Revisar e ajustar estratégias a cada 3 meses"
    ]
  };
  
  // Dicas e observações gerais sobre TDAH
  const generalInsights = [
    "O TDAH é uma condição neurobiológica com forte componente genético",
    "Abordagens multimodais (terapia, adaptações, e quando indicado, medicação) mostram melhores resultados",
    "Os sintomas podem variar em intensidade ao longo do tempo e em diferentes contextos",
    "Forças frequentemente associadas ao TDAH incluem criatividade, hiperfoco em temas de interesse e pensamento não-linear",
    "A identificação e manejo adequados podem significativamente melhorar a qualidade de vida"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
        <div className="max-w-3xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4 p-0" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-6 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-14 w-14 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                      <FileText className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold dark:text-white">Relatório Detalhado</h2>
                      <p className="text-purple-600 dark:text-purple-400 text-sm">
                        Análise Completa e Personalizada
                      </p>
                    </div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mr-1.5" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                      Premium
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                    Este relatório detalhado foi gerado com base nas suas respostas ao questionário de 
                    avaliação de indícios de TDAH. Ele oferece uma análise aprofundada das três principais 
                    áreas: desatenção, hiperatividade e impulsividade.
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-900/30">
                    <strong>Nota importante:</strong> Este relatório não constitui um diagnóstico médico. 
                    O TDAH só pode ser diagnosticado por profissionais de saúde qualificados após uma 
                    avaliação clínica completa.
                  </p>
                </div>
                
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-5 mb-6">
                  <h3 className="font-medium text-lg mb-3 dark:text-white flex items-center">
                    <BrainIcon className="h-5 w-5 mr-2 text-primary" />
                    Visão Geral do Perfil
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium dark:text-white">Nível Global</span>
                        <span className="text-sm font-medium dark:text-white">{category === 'low' ? 'Baixo' : category === 'moderate' ? 'Moderado' : 'Alto'}</span>
                      </div>
                      <Progress value={category === 'low' ? 30 : category === 'moderate' ? 65 : 100} 
                        className={`h-2.5 ${
                          category === 'low' 
                            ? 'bg-green-200 dark:bg-green-900/30' 
                            : category === 'moderate' 
                              ? 'bg-amber-200 dark:bg-amber-900/30' 
                              : 'bg-red-200 dark:bg-red-900/30'
                        }`}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-white dark:bg-neutral-850 p-4 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium dark:text-white">Desatenção</h4>
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                            {Math.round(inattentionPercent)}%
                          </span>
                        </div>
                        <Progress value={inattentionPercent} className="h-1.5 bg-purple-100 dark:bg-purple-900/30" />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                          {inattentionPercent > 70 ? 'Indicativo forte' : 
                           inattentionPercent > 50 ? 'Indicativo moderado' : 
                           'Indicativo leve'}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-neutral-850 p-4 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium dark:text-white">Hiperatividade</h4>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            {Math.round(hyperactivityPercent)}%
                          </span>
                        </div>
                        <Progress value={hyperactivityPercent} className="h-1.5 bg-blue-100 dark:bg-blue-900/30" />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                          {hyperactivityPercent > 70 ? 'Indicativo forte' : 
                           hyperactivityPercent > 50 ? 'Indicativo moderado' : 
                           'Indicativo leve'}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-neutral-850 p-4 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium dark:text-white">Impulsividade</h4>
                          <span className="text-xs bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                            {Math.round(impulsivityPercent)}%
                          </span>
                        </div>
                        <Progress value={impulsivityPercent} className="h-1.5 bg-indigo-100 dark:bg-indigo-900/30" />
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                          {impulsivityPercent > 70 ? 'Indicativo forte' : 
                           impulsivityPercent > 50 ? 'Indicativo moderado' : 
                           'Indicativo leve'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Seções detalhadas */}
                {Object.entries(detailedData).map(([key, section]) => (
                  <motion.div 
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-bold mb-3 dark:text-white">
                      {section.title}
                    </h3>
                    
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-5 mb-5 border border-neutral-200 dark:border-neutral-700">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-neutral-700 dark:text-neutral-300">
                          {section.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium dark:text-white">Intensidade</span>
                        <span className="text-sm font-medium bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded">
                          {section.score} / {section.maxScore} pontos
                        </span>
                      </div>
                      
                      <Progress 
                        value={(section.score / section.maxScore) * 100} 
                        className={`h-2 mb-6 ${
                          key === 'inattention' ? 'bg-purple-600' : 
                          key === 'hyperactivity' ? 'bg-blue-600' : 
                          'bg-indigo-600'
                        }`}
                      />
                      
                      <div className="mb-5">
                        <h4 className="font-medium mb-2 dark:text-white flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                          Principais Observações
                        </h4>
                        <ul className="space-y-2">
                          {section.insights.map((insight, index) => (
                            <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start">
                              <span className="text-amber-600 dark:text-amber-400 mr-2">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mb-5">
                        <h4 className="font-medium mb-2 dark:text-white flex items-center">
                          <ActivityIcon className="h-4 w-4 mr-2 text-green-500" />
                          Recomendações Personalizadas
                        </h4>
                        <ul className="space-y-2">
                          {section.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/50 p-2 rounded flex items-start">
                              <span className={`inline-block h-5 w-5 rounded-full mr-2 flex-shrink-0 ${
                                rec.type === 'lifestyle' ? 'bg-green-100 dark:bg-green-900/30' : 
                                rec.type === 'medical' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                                rec.type === 'educational' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                'bg-amber-100 dark:bg-amber-900/30'
                              } flex items-center justify-center`}>
                                <span className={`text-xs ${
                                  rec.type === 'lifestyle' ? 'text-green-600 dark:text-green-400' : 
                                  rec.type === 'medical' ? 'text-blue-600 dark:text-blue-400' : 
                                  rec.type === 'educational' ? 'text-purple-600 dark:text-purple-400' :
                                  'text-amber-600 dark:text-amber-400'
                                }`}>
                                  {rec.type === 'lifestyle' ? 'L' : 
                                   rec.type === 'medical' ? 'M' : 
                                   rec.type === 'educational' ? 'E' : 'P'}
                                </span>
                              </span>
                              {rec.text}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-2 mt-3 text-xs">
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded flex items-center">
                            <span className="font-bold mr-1">L:</span> Estilo de vida
                          </span>
                          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded flex items-center">
                            <span className="font-bold mr-1">M:</span> Médico
                          </span>
                          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded flex items-center">
                            <span className="font-bold mr-1">E:</span> Educacional
                          </span>
                          <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded flex items-center">
                            <span className="font-bold mr-1">P:</span> Profissional
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 dark:text-white flex items-center">
                          <BookIcon className="h-4 w-4 mr-2 text-blue-500" />
                          Recursos Recomendados
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {section.resources.map((resource, index) => (
                            <div key={index} className="bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded border border-neutral-200 dark:border-neutral-700">
                              <h5 className="text-sm font-medium mb-1 dark:text-white">{resource.title}</h5>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {resource.description}
                              </p>
                              {resource.url && (
                                <Button variant="link" className="p-0 h-auto text-xs mt-1">
                                  Acessar recurso
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Plano de ação consolidado */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mb-8"
                >
                  <h3 className="text-xl font-bold mb-3 dark:text-white">
                    Plano de Ação Personalizado
                  </h3>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-5 border border-purple-200 dark:border-purple-800">
                    <p className="text-neutral-700 dark:text-neutral-300 mb-4">
                      Com base na análise de seus resultados, elaboramos um plano de ação 
                      estruturado para auxiliar no gerenciamento dos sintomas identificados.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 dark:text-white flex items-center">
                          <span className="inline-block h-5 w-5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-xs font-bold flex items-center justify-center mr-2">1</span>
                          Ações Imediatas (Próximos 7 dias)
                        </h4>
                        <ul className="pl-7 space-y-1">
                          {actionPlan.immediate.map((action, index) => (
                            <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300 list-disc">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 dark:text-white flex items-center">
                          <span className="inline-block h-5 w-5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold flex items-center justify-center mr-2">2</span>
                          Ações de Curto Prazo (Próximos 30 dias)
                        </h4>
                        <ul className="pl-7 space-y-1">
                          {actionPlan.shortTerm.map((action, index) => (
                            <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300 list-disc">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 dark:text-white flex items-center">
                          <span className="inline-block h-5 w-5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-xs font-bold flex items-center justify-center mr-2">3</span>
                          Ações de Longo Prazo (Próximos 3-6 meses)
                        </h4>
                        <ul className="pl-7 space-y-1">
                          {actionPlan.longTerm.map((action, index) => (
                            <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300 list-disc">
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Informações adicionais e considerações finais */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <h3 className="text-xl font-bold mb-3 dark:text-white">
                    Considerações Finais
                  </h3>
                  
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-5 mb-6">
                    <h4 className="font-medium mb-3 dark:text-white flex items-center">
                      <BarChart3Icon className="h-4 w-4 mr-2 text-primary" />
                      Pontos Importantes Sobre TDAH
                    </h4>
                    
                    <ul className="space-y-2 mb-4">
                      {generalInsights.map((insight, index) => (
                        <li key={index} className="text-sm text-neutral-700 dark:text-neutral-300 flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                    
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-4">
                      Este relatório foi elaborado como um recurso educacional e de apoio. 
                      Recomendamos compartilhar estes resultados com profissionais de saúde para 
                      uma avaliação completa e orientações específicas para o seu caso.
                    </p>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <Button variant="outline" className="gap-2">
                      <DownloadIcon className="h-4 w-4" />
                      Baixar Relatório PDF
                    </Button>
                    <Link href={`/results/${resultId}`}>
                      <Button variant="outline">
                        Voltar para Resumo
                      </Button>
                    </Link>
                  </div>
                </motion.div>
                
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}