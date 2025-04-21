import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserLevel } from "@shared/schema";

export function useUserLevel() {
  const { toast } = useToast();

  // Buscar nível do usuário
  const {
    data: userLevel,
    isLoading: isLoadingUserLevel,
    error: userLevelError,
  } = useQuery<UserLevel>({
    queryKey: ["/api/user/level"],
    retry: (failureCount, error: any) => {
      // Não tentar novamente se o erro for de autenticação
      return error?.status !== 401 && failureCount < 3;
    },
  });

  // Atualizar streak de login
  const updateLoginStreakMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/level/login-streak");
      return await res.json();
    },
    onSuccess: (updatedLevel: UserLevel) => {
      queryClient.setQueryData(["/api/user/level"], updatedLevel);
      
      // Verificar se o streak foi atualizado
      if (userLevel && updatedLevel.loginStreak > userLevel.loginStreak) {
        toast({
          title: "🔥 Sequência de Login Atualizada!",
          description: `Você manteve uma sequência de ${updatedLevel.loginStreak} dias. Continue voltando diariamente!`,
        });
      }
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar streak de login:", error);
    },
  });

  // Calcular porcentagem de XP para o próximo nível
  const calculateXpPercentage = () => {
    if (!userLevel) return 0;
    
    const { xpPoints, xpToNextLevel } = userLevel;
    return Math.min(100, Math.floor((xpPoints / xpToNextLevel) * 100));
  };

  // Verificar se o usuário subiu de nível
  const checkLevelUp = (oldLevel: UserLevel, newLevel: UserLevel) => {
    if (newLevel.level > oldLevel.level) {
      toast({
        title: "🎉 Parabéns! Você subiu de nível!",
        description: `Você alcançou o nível ${newLevel.level}!`,
        duration: 6000,
      });
      return true;
    }
    return false;
  };

  return {
    userLevel,
    isLoadingUserLevel,
    userLevelError,
    updateLoginStreakMutation,
    calculateXpPercentage,
    checkLevelUp,
  };
}