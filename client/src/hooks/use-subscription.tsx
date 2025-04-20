import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Subscription, PremiumFeature } from "@shared/schema";

type SubscriptionContextType = {
  subscription: Subscription | null;
  isLoadingSubscription: boolean;
  premiumFeatures: PremiumFeature[];
  isLoadingFeatures: boolean;
  userPremiumFeatures: {
    features: PremiumFeature[];
    hasActiveSubscription: boolean;
  } | null;
  isLoadingUserFeatures: boolean;
  createSubscriptionMutation: UseMutationResult<any, Error, { planType: 'monthly' | 'yearly' }>;
  cancelSubscriptionMutation: UseMutationResult<any, Error, void>;
  isPremium: boolean;
};

export const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar assinatura atual do usuário
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
  } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Buscar recursos premium disponíveis
  const {
    data: premiumFeatures = [],
    isLoading: isLoadingFeatures,
  } = useQuery({
    queryKey: ['/api/premium-features'],
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  // Buscar recursos premium do usuário
  const {
    data: userPremiumFeatures,
    isLoading: isLoadingUserFeatures,
  } = useQuery({
    queryKey: ['/api/user/premium-features'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Criar uma nova assinatura
  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: { planType: 'monthly' | 'yearly' }) => {
      const res = await apiRequest("POST", "/api/subscription/create", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/premium-features'] });
      toast({
        title: "Assinatura criada",
        description: "Sua assinatura premium foi criada com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar assinatura",
        description: error.message || "Ocorreu um erro ao processar sua assinatura. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Cancelar assinatura
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscription/cancel");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/premium-features'] });
      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura premium foi cancelada. Você ainda terá acesso aos recursos premium até o final do período atual.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cancelar assinatura",
        description: error.message || "Ocorreu um erro ao cancelar sua assinatura. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Determinar se o usuário é premium (tem uma assinatura ativa ou recursos premium)
  const isPremium = !!userPremiumFeatures?.hasActiveSubscription;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoadingSubscription,
        premiumFeatures,
        isLoadingFeatures,
        userPremiumFeatures,
        isLoadingUserFeatures,
        createSubscriptionMutation,
        cancelSubscriptionMutation,
        isPremium,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}

export type { PremiumFeature };