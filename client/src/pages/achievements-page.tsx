import React, { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserLevel } from "@/hooks/use-user-level";
import { UserLevelCard } from "@/components/user-level/UserLevelCard";
import { AchievementGrid } from "@/components/achievements/AchievementGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trophy, Award, Target, Rocket, Calendar, ListTodo } from "lucide-react";
import { Redirect } from "wouter";

export default function AchievementsPage() {
  const { user, isLoading } = useAuth();
  const { updateLoginStreakMutation } = useUserLevel();
  
  // Atualizar o streak de login quando o usuário acessar a página (uma vez por dia)
  useEffect(() => {
    if (user) {
      updateLoginStreakMutation.mutate();
    }
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="container py-8 px-4 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded-md w-1/3"></div>
          <div className="h-40 bg-muted rounded-md"></div>
          <div className="h-8 bg-muted rounded-md w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-60 bg-muted rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <Trophy className="mr-2 h-7 w-7 text-yellow-500" />
          Progresso e Conquistas
        </h1>
        <p className="text-muted-foreground">
          Acompanhe seu desenvolvimento, conquistas desbloqueadas e ganhe recompensas pelo seu progresso.
        </p>
      </header>
      
      <UserLevelCard className="mb-8" />
      
      <Tabs defaultValue="achievements" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="achievements" className="flex items-center justify-center">
            <Award className="mr-2 h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center justify-center">
            <Rocket className="mr-2 h-4 w-4" />
            Benefícios
          </TabsTrigger>
          <TabsTrigger value="next-goals" className="flex items-center justify-center">
            <Target className="mr-2 h-4 w-4" />
            Próximos Objetivos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievements">
          <AchievementGrid />
        </TabsContent>
        
        <TabsContent value="benefits">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Benefícios por Nível</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ListTodo className="mr-2 h-5 w-5 text-primary" />
                    Nível 5
                  </CardTitle>
                  <CardDescription>Acesso a recursos adicionais</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Análises mais detalhadas de humor</li>
                    <li>Desbloqueio de temas adicionais</li>
                    <li>Capacidade de exportar dados</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-primary" />
                    Nível 10
                  </CardTitle>
                  <CardDescription>Recursos avançados</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Histórico de resultados expandido</li>
                    <li>Acesso antecipado a novos recursos</li>
                    <li>Descontos em assinaturas premium</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Rocket className="mr-2 h-5 w-5 text-primary" />
                    Nível 20
                  </CardTitle>
                  <CardDescription>Benefícios exclusivos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Emblemas exclusivos no perfil</li>
                    <li>Acesso a comunidade exclusiva</li>
                    <li>Ferramentas avançadas de acompanhamento</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-primary" />
                    Nível 30
                  </CardTitle>
                  <CardDescription>Benefícios premium</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Período de teste premium gratuito estendido</li>
                    <li>Recursos personalizados baseados nos seus dados</li>
                    <li>Acesso a conteúdo educacional exclusivo</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="next-goals">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Seus Próximos Objetivos</h2>
            <p className="text-muted-foreground">
              Continue usando o aplicativo para desbloquear estes objetivos e receber recompensas.
            </p>
            
            <div className="space-y-4">
              {/* Aqui podem ser mostrados objetivos gerados dinamicamente com base nos dados do usuário */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Complete 3 dias seguidos de registro de humor</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={33} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1/3 completado</span>
                    <span>+15 XP</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Leia 5 artigos do conteúdo educacional</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={20} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1/5 completado</span>
                    <span>+25 XP</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Complete seu próximo questionário</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={0} className="h-2 mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0/1 completado</span>
                    <span>+30 XP</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="text-center text-sm text-muted-foreground">
        <p>O sistema de conquistas e gamificação está em constante evolução.</p>
        <p>Novas conquistas e recursos são adicionados regularmente para ajudar em sua jornada.</p>
      </div>
    </div>
  );
}