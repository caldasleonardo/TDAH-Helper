import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartPieIcon, UserIcon, BookIcon, CalendarCheckIcon, UsersIcon, ShareIcon, RotateCcwIcon, SaveIcon, CheckCircle, ArrowRight } from "lucide-react";
import { interpretations } from "@/lib/quiz-data";
import { motion } from "framer-motion";

export default function ResultsPage() {
  const [, params] = useRoute("/results/:id");
  const resultId = params?.id;
  
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
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-center mb-6">
                  <Skeleton className="h-24 w-24 rounded-full" />
                </div>
                <Skeleton className="h-8 w-40 mx-auto mb-2" />
                <Skeleton className="h-4 w-full mb-6" />
                <Skeleton className="h-32 w-full mb-6" />
                <Skeleton className="h-40 w-full mb-6" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-10 w-full mb-3" />
                <Skeleton className="h-10 w-full" />
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
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-center mb-4">Erro ao carregar resultados</h2>
                <p className="text-neutral-600 dark:text-neutral-300 text-center mb-6">
                  Não foi possível carregar seus resultados. Por favor, tente novamente.
                </p>
                <Link href="/quiz">
                  <Button className="w-full">Voltar para o quiz</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <BottomNav />
      </div>
    );
  }
  
  const category = result.category || "moderate";
  const interpretation = interpretations[category as keyof typeof interpretations];
  
  const calculatePercentage = (score: number, maxPossible: number) => {
    return (score / maxPossible) * 100;
  };
  
  const inattentionPercent = calculatePercentage(result.inattentionScore || 0, 27); // 9 inattention questions * 3 (max score per question)
  const hyperactivityPercent = calculatePercentage(result.hyperactivityScore || 0, 9); // 3 hyperactivity questions * 3
  const impulsivityPercent = calculatePercentage(result.impulsivityScore || 0, 15); // 5 impulsivity questions * 3
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-center mb-6">
                  <div className="h-24 w-24 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-full">
                    <ChartPieIcon className="h-12 w-12 text-primary" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center mb-2 dark:text-white">Seu Resultado</h2>
                <p className="text-neutral-600 dark:text-neutral-300 text-center mb-6">
                  Baseado nas suas respostas, identificamos o seguinte:
                </p>
                
                {/* Result visualization */}
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium dark:text-white">Nível de Indícios</h3>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full
                      ${category === 'low' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : ''}
                      ${category === 'moderate' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : ''}
                      ${category === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : ''}
                    `}>
                      {interpretation.title}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Baixo</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Moderado</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Alto</span>
                  </div>
                  
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mb-6">
                    <div 
                      className={`h-3 rounded-full
                        ${category === 'low' ? 'bg-green-500' : ''}
                        ${category === 'moderate' ? 'bg-amber-500' : ''}
                        ${category === 'high' ? 'bg-red-500' : ''}
                      `}
                      style={{ 
                        width: category === 'low' 
                          ? '30%' 
                          : category === 'moderate' 
                            ? '65%' 
                            : '100%' 
                      }}
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2 dark:text-white">Áreas observadas:</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Desatenção</span>
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full
                              ${category === 'low' ? 'bg-green-500' : ''}
                              ${category === 'moderate' ? 'bg-amber-500' : ''}
                              ${category === 'high' ? 'bg-red-500' : ''}
                            `}
                            style={{ width: `${inattentionPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Hiperatividade</span>
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full
                              ${category === 'low' ? 'bg-green-500' : ''}
                              ${category === 'moderate' ? 'bg-amber-500' : ''}
                              ${category === 'high' ? 'bg-red-500' : ''}
                            `}
                            style={{ width: `${hyperactivityPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Impulsividade</span>
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full
                              ${category === 'low' ? 'bg-green-500' : ''}
                              ${category === 'moderate' ? 'bg-amber-500' : ''}
                              ${category === 'high' ? 'bg-red-500' : ''}
                            `}
                            style={{ width: `${impulsivityPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Personalized explanation */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 dark:text-white">O que isso significa?</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-3">
                    {interpretation.description}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                    <strong>Lembre-se:</strong> Este resultado não é um diagnóstico. O TDAH só pode ser diagnosticado por profissionais de saúde mental qualificados após uma avaliação abrangente.
                  </p>
                </div>
                
                {/* Next steps */}
                <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-5 mb-6">
                  <h3 className="font-semibold mb-3 dark:text-white">Próximos Passos Recomendados</h3>
                  <ul className="space-y-3">
                    {interpretation.recommendations.map((rec, index) => (
                      <li className="flex" key={index}>
                        {rec.icon === 'user-md' && <UserIcon className="w-4 h-4 text-primary mt-0.5 mr-3" />}
                        {rec.icon === 'book' && <BookIcon className="w-4 h-4 text-primary mt-0.5 mr-3" />}
                        {rec.icon === 'calendar-check' && <CalendarCheckIcon className="w-4 h-4 text-primary mt-0.5 mr-3" />}
                        {rec.icon === 'users' && <UsersIcon className="w-4 h-4 text-primary mt-0.5 mr-3" />}
                        {rec.icon === 'brain' && <ChartPieIcon className="w-4 h-4 text-primary mt-0.5 mr-3" />}
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">{rec.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Relatório Premium */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg p-5 mb-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start mb-3">
                    <div className="h-10 w-10 flex items-center justify-center bg-purple-600 dark:bg-purple-600 rounded-full mr-3">
                      <ChartPieIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg dark:text-white">Relatório Completo e Detalhado</h3>
                      <p className="text-neutral-600 dark:text-neutral-300 text-sm">
                        {result.premiumPaid ? 'Você já possui acesso ao relatório completo' : 'Obtenha uma análise aprofundada dos seus resultados'}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start">
                      <div className="text-purple-600 dark:text-purple-400 mr-2 mt-0.5">✓</div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Questionário estendido com 30 perguntas específicas</span>
                    </li>
                    <li className="flex items-start">
                      <div className="text-purple-600 dark:text-purple-400 mr-2 mt-0.5">✓</div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Análise detalhada por sintoma e comportamento</span>
                    </li>
                    <li className="flex items-start">
                      <div className="text-purple-600 dark:text-purple-400 mr-2 mt-0.5">✓</div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Recomendações personalizadas para cada área</span>
                    </li>
                    <li className="flex items-start">
                      <div className="text-purple-600 dark:text-purple-400 mr-2 mt-0.5">✓</div>
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Documento em PDF com gráficos e estatísticas</span>
                    </li>
                  </ul>
                  
                  {result.premiumPaid ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-300 text-sm">Relatório Adquirido</h4>
                        <p className="text-green-600 dark:text-green-400 text-xs">
                          Você já possui acesso completo a este relatório
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-purple-700 dark:text-purple-400">R$12,90</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">pagamento único</span>
                        </div>
                        <Link href={`/checkout/${resultId}`}>
                          <Button className="bg-purple-600 hover:bg-purple-700">
                            Adquirir agora
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="mt-4 border-t pt-4 border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium">Quer acesso a todos os relatórios?</h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Assine o plano premium e obtenha acesso ilimitado!
                            </p>
                          </div>
                          <Link href="/premium">
                            <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/30">
                              Conhecer planos
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                      
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                        Relatório enviado para seu e-mail em até 24 horas
                      </p>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <Button className="w-full py-6 text-base">
                    <SaveIcon className="mr-2 h-4 w-4" /> Salvar resultado
                  </Button>
                  <Button variant="outline" className="w-full py-6 text-base">
                    <ShareIcon className="mr-2 h-4 w-4" /> Compartilhar resultado
                  </Button>
                  <Link href="/quiz">
                    <Button variant="outline" className="w-full py-6 text-base">
                      <RotateCcwIcon className="mr-2 h-4 w-4" /> Fazer outro teste
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
