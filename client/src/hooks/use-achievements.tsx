import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Achievement } from "@shared/schema";

interface UserAchievement {
  achievement: Achievement;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

export function useAchievements() {
  const { toast } = useToast();

  // Buscar todas as conquistas
  const {
    data: achievements = [],
    isLoading: isLoadingAchievements,
    error: achievementsError,
  } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  // Buscar conquistas do usuário atual
  const {
    data: userAchievements = [],
    isLoading: isLoadingUserAchievements,
    error: userAchievementsError,
  } = useQuery<UserAchievement[]>({
    queryKey: ["/api/user/achievements"],
    retry: (failureCount, error: any) => {
      // Não tentar novamente se o erro for de autenticação
      return error?.status !== 401 && failureCount < 3;
    },
  });

  // Buscar conquistas por categoria
  const getAchievementsByCategory = (category: string) => {
    return useQuery<Achievement[]>({
      queryKey: ["/api/achievements/category", category],
      enabled: !!category,
    });
  };

  // Notificar usuário sobre nova conquista
  const notifyAchievement = (achievement: Achievement) => {
    toast({
      title: "🏆 Nova Conquista Desbloqueada!",
      description: `${achievement.title}: ${achievement.description}`,
      duration: 6000,
    });
  };

  return {
    achievements,
    userAchievements,
    isLoadingAchievements,
    isLoadingUserAchievements,
    achievementsError,
    userAchievementsError,
    getAchievementsByCategory,
    notifyAchievement,
  };
}