import React from "react";
import { AchievementBadge } from "./AchievementBadge";
import { useAchievements } from "@/hooks/use-achievements";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";

interface AchievementGridProps {
  className?: string;
}

export function AchievementGrid({ className }: AchievementGridProps) {
  const { userAchievements, isLoadingUserAchievements } = useAchievements();
  
  // Agrupar conquistas por categoria
  const achievementsByCategory = userAchievements.reduce((acc, ua) => {
    const category = ua.achievement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(ua);
    return acc;
  }, {} as Record<string, typeof userAchievements>);
  
  // Obter categorias para as abas
  const categories = Object.keys(achievementsByCategory).sort();
  
  // Total de conquistas concluídas
  const totalCompleted = userAchievements.filter(ua => ua.completed).length;
  const totalAchievements = userAchievements.length;
  
  // Tradução de categorias
  const categoryTranslations: Record<string, string> = {
    "login_streak": "Sequência de Login",
    "quiz_completion": "Questionários",
    "content_reading": "Leitura de Conteúdo",
    "mood_tracking": "Registro de Humor",
    "profile_completion": "Perfil",
    "general": "Geral"
  };
  
  if (isLoadingUserAchievements) {
    return <AchievementGridSkeleton />;
  }
  
  if (userAchievements.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-semibold mb-2">Nenhuma conquista disponível</h3>
        <p className="text-muted-foreground">
          Continue usando o aplicativo para desbloquear conquistas.
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Suas Conquistas</h2>
        <Badge variant="outline" className="px-3 py-1">
          {totalCompleted} / {totalAchievements} Concluídas
        </Badge>
      </div>
      
      <Tabs defaultValue={categories[0]}>
        <TabsList className="w-full mb-4 overflow-x-auto flex flex-nowrap">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="flex-none"
            >
              {categoryTranslations[category] || category}
              <Badge variant="secondary" className="ml-2">
                {achievementsByCategory[category].filter(ua => ua.completed).length}/
                {achievementsByCategory[category].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievementsByCategory[category]
                .sort((a, b) => {
                  // Coloca as completas no topo, depois ordena por progresso
                  if (a.completed && !b.completed) return -1;
                  if (!a.completed && b.completed) return 1;
                  return b.progress - a.progress;
                })
                .map(ua => (
                  <AchievementBadge
                    key={ua.achievement.id}
                    achievement={ua.achievement}
                    progress={ua.progress}
                    completed={ua.completed}
                    completedAt={ua.completedAt}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>Complete tarefas e conquistas para ganhar XP e subir de nível!</p>
        <p className="flex items-center justify-center mt-1">
          <PlusCircle className="w-4 h-4 mr-1" />
          Novas conquistas são adicionadas regularmente.
        </p>
      </div>
    </div>
  );
}

function AchievementGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-10 w-full mt-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}