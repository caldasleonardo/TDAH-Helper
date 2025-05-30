import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartPieIcon, UserIcon, BookIcon, CalendarCheckIcon, UsersIcon, ShareIcon, RotateCcwIcon, SaveIcon, CheckCircle, ArrowRight, SparklesIcon, ZapIcon, ArrowRightCircleIcon, TagIcon } from "lucide-react";
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
  
  // Determinar o nível de cada área
  const getLevel = (percent: number) => {
    if (percent < 33) return { level: 'baixo', color: 'bg-green-500' };
    if (percent < 66) return { level: 'médio', color: 'bg-amber-500' };
    return { level: 'alto', color: 'bg-red-500' };
  };
  
  const inattentionLevel = getLevel(inattentionPercent);
  const hyperactivityLevel = getLevel(hyperactivityPercent);
  const impulsivityLevel = getLevel(impulsivityPercent);
  
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
                        <div className="flex items-center">
                          <span className="text-sm text-neutral-700 dark:text-neutral-300 mr-2">Desatenção</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium capitalize
                            ${inattentionLevel.level === 'baixo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                            ${inattentionLevel.level === 'médio' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                            ${inattentionLevel.level === 'alto' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                          ">
                            {inattentionLevel.level}
                          </span>
                        </div>
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${inattentionLevel.color}`}
                            style={{ width: `${inattentionPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm text-neutral-700 dark:text-neutral-300 mr-2">Hiperatividade</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium capitalize
                            ${hyperactivityLevel.level === 'baixo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                            ${hyperactivityLevel.level === 'médio' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                            ${hyperactivityLevel.level === 'alto' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                          ">
                            {hyperactivityLevel.level}
                          </span>
                        </div>
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${hyperactivityLevel.color}`}
                            style={{ width: `${hyperactivityPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-sm text-neutral-700 dark:text-neutral-300 mr-2">Impulsividade</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium capitalize
                            ${impulsivityLevel.level === 'baixo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                            ${impulsivityLevel.level === 'médio' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                            ${impulsivityLevel.level === 'alto' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                          ">
                            {impulsivityLevel.level}
                          </span>
                        </div>
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-2 rounded-full ${impulsivityLevel.color}`}
                            style={{ width: `${impulsivityPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Relatório Premium - Versão Destacada */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/40 rounded-lg p-6 mb-8 border-2 border-purple-300 dark:border-purple-700 shadow-lg"
                >
                  {/* Etiqueta Especial */}
                  <div className="absolute -top-3 -right-2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
                    <TagIcon className="h-3 w-3 mr-1" />
                    ESPECIAL
                  </div>
                  
                  <motion.div 
                    animate={{ 
                      rotate: [0, 5, 0, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                    className="absolute -top-4 -left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-md transform rotate-12"
                  >
                    Destaque
                  </motion.div>
                  
                  <div className="flex items-start mb-4">
                    <motion.div 
                      animate={{ 
                        y: [0, -5, 0],
                        rotate: [0, 5, 0, -5, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        repeatType: "reverse" 
                      }}
                      className="h-14 w-14 flex items-center justify-center bg-purple-600 dark:bg-purple-600 rounded-full mr-4 shadow-md"
                    >
                      <SparklesIcon className="h-7 w-7 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-xl text-purple-800 dark:text-purple-300">Relatório Completo e Detalhado</h3>
                      <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
                        <ZapIcon className="h-4 w-4 mr-1" />
                        <p className="text-sm">
                          {result.premiumPaid ? 'Você já possui acesso ao relatório completo' : 'Análise aprofundada personalizada para você'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/70 dark:bg-black/20 rounded-lg p-4 mb-4 border border-purple-200 dark:border-purple-800/40">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center">
                      <ZapIcon className="h-4 w-4 mr-2" />
                      O que está incluído:
                    </h4>
                    <ul className="space-y-2.5">
                      <motion.li 
                        whileHover={{ x: 5 }}
                        className="flex items-start"
                      >
                        <div className="text-purple-600 dark:text-purple-400 mr-2 mt-0.5 font-bold">✓</div>
                        <span className="text-sm text-purple-900 dark:text-purple-100 font-medium">Questionário estendido com 30 perguntas específicas</span>
                      </motion.li>
                      <motion.li 
                        whileHover={{ x: 5 }}
                        className="flex items-start"
                      >
                        <div className="text-purple-600 dark:text-purple-400 mr-2 mt-0.5 font-bold">✓</div>
                        <span className="text-sm text-purple-900 dark:text-purple-100 font-medium">Análise detalhada por sintoma e comportamento</span>
                      </motion.li>
                      <motion.li 
                        whileHover={{ x: 5 }}
                        className="flex items-start"
                      >
                        <div className="text-purple-600 dark:text-purple-400 mr-2 mt-0.5 font-bold">✓</div>
                        <span className="text-sm text-purple-900 dark:text-purple-100 font-medium">Recomendações personalizadas para cada área</span>
                      </motion.li>
                      <motion.li 
                        whileHover={{ x: 5 }}
                        className="flex items-start"
                      >
                        <div className="text-purple-600 dark:text-purple-400 mr-2 mt-0.5 font-bold">✓</div>
                        <span className="text-sm text-purple-900 dark:text-purple-100 font-medium">Documento em PDF com gráficos e estatísticas</span>
                      </motion.li>
                    </ul>
                  </div>
                  
                  {result.premiumPaid ? (
                    <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-md mb-3">
                      <div className="flex items-center mb-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                        </motion.div>
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-300 text-base">Relatório Adquirido</h4>
                          <p className="text-green-700 dark:text-green-500 text-sm">
                            Você já possui acesso completo a este relatório
                          </p>
                        </div>
                      </div>
                      <Link href={`/detailed-report/${resultId}`}>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          Acessar Relatório Detalhado
                          <ArrowRightCircleIcon className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5 bg-white/70 dark:bg-black/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800/40">
                        <div className="mb-4 md:mb-0">
                          <div className="flex items-baseline">
                            <motion.span 
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="text-3xl font-extrabold text-purple-700 dark:text-purple-400"
                            >
                              R$12,90
                            </motion.span>
                            <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 text-xs font-bold ml-2 px-2 py-0.5 rounded">
                              pagamento único
                            </span>
                          </div>
                          <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                            Sem mensalidades ou taxas adicionais
                          </p>
                        </div>
                        <Link href={`/checkout/${resultId}`} className="w-full md:w-auto">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full md:w-auto"
                          >
                            <Button className="bg-purple-600 hover:bg-purple-700 text-base py-4 font-bold shadow-md w-full md:px-5 md:py-6">
                              <span className="mr-2">Adquirir agora</span>
                              <ArrowRightCircleIcon className="h-5 w-5 inline-flex" />
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                      
                      <div className="mt-3 bg-indigo-50/70 dark:bg-indigo-950/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800/40">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Quer acesso a todos os relatórios?</h4>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                              Assine o plano premium e obtenha acesso ilimitado!
                            </p>
                          </div>
                          <Link href="/premium">
                            <motion.div
                              whileHover={{ x: 5 }}
                            >
                              <Button variant="outline" size="sm" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30">
                                Conhecer planos
                                <ArrowRight className="ml-1 h-3 w-3" />
                              </Button>
                            </motion.div>
                          </Link>
                        </div>
                      </div>
                      
                      <p className="text-xs text-purple-500 dark:text-purple-400 text-center mt-4 font-medium">
                        Relatório enviado para seu e-mail em até 24 horas
                      </p>
                    </>
                  )}
                </motion.div>
                
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