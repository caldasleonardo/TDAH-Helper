import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { UserIcon, HistoryIcon, LogOutIcon, ChartPieIcon, CalendarIcon, ShieldIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  
  const { data: quizResults = [] } = useQuery({
    queryKey: ["/api/quiz-results"],
    enabled: !!user,
  });
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'low': return 'Baixo';
      case 'moderate': return 'Moderado';
      case 'high': return 'Alto';
      default: return 'Desconhecido';
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'low': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'moderate': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
      case 'high': return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };
  
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
            <div className="mb-6 flex flex-col items-center">
              <div className="h-20 w-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold dark:text-white">{user?.username}</h1>
              {user?.email && (
                <p className="text-neutral-600 dark:text-neutral-400">{user.email}</p>
              )}
            </div>
            
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="history">
                  <HistoryIcon className="h-4 w-4 mr-2" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <ShieldIcon className="h-4 w-4 mr-2" />
                  Conta
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="history">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <ChartPieIcon className="h-5 w-5 mr-2" />
                      Histórico de Resultados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {quizResults.length > 0 ? (
                      <div className="space-y-4">
                        {quizResults.map((result: any) => (
                          <Link key={result.id} href={`/results/${result.id}`}>
                            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400 mr-2" />
                                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                    {formatDate(result.date)}
                                  </span>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(result.category)}`}>
                                  {getCategoryLabel(result.category)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                                  Pontuação: {result.score}
                                </span>
                                <span className="text-sm text-primary">Ver detalhes →</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                          Você ainda não realizou nenhum teste
                        </p>
                        <Link href="/quiz">
                          <Button>Fazer meu primeiro teste</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <UserIcon className="h-5 w-5 mr-2" />
                      Gerenciar Conta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="destructive"
                      className="w-full flex items-center"
                      onClick={() => logoutMutation.mutate()}
                    >
                      <LogOutIcon className="h-4 w-4 mr-2" />
                      Sair da conta
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-4">
                        Versão do aplicativo: 1.0.0
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
