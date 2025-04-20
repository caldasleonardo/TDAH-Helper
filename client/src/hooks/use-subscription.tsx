import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn, apiRequest } from '@/lib/queryClient';
import { useToast } from './use-toast';

export type PremiumFeature = {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
};

export type Subscription = {
  id: number;
  userId: number;
  stripeSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  planType: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  canceledAt?: string;
};

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
  createSubscriptionMutation: any;
  cancelSubscriptionMutation: any;
  isPremium: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Buscar assinatura atual
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
  } = useQuery<Subscription | null>({
    queryKey: ['/api/subscriptions/current'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Buscar funcionalidades premium disponíveis
  const {
    data: premiumFeatures = [],
    isLoading: isLoadingFeatures,
  } = useQuery<PremiumFeature[]>({
    queryKey: ['/api/premium-features'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    staleTime: 1000 * 60 * 60, // 1 hora
  });

  // Buscar as funcionalidades premium do usuário
  const {
    data: userPremiumFeatures,
    isLoading: isLoadingUserFeatures,
  } = useQuery<{
    features: PremiumFeature[];
    hasActiveSubscription: boolean;
  } | null>({
    queryKey: ['/api/user/premium-features'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Verificar se o usuário é premium
  const isPremium = !!userPremiumFeatures?.hasActiveSubscription;

  // Mutação para criar uma assinatura
  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ planType }: { planType: 'monthly' | 'yearly' }) => {
      const res = await apiRequest('POST', '/api/subscriptions', { planType });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/premium-features'] });
      toast({
        title: 'Assinatura iniciada',
        description: 'Sua assinatura foi criada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar assinatura',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutação para cancelar uma assinatura
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async ({ subscriptionId }: { subscriptionId: number }) => {
      const res = await apiRequest('POST', '/api/subscriptions/cancel', { subscriptionId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/premium-features'] });
      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura foi cancelada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao cancelar assinatura',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <SubscriptionContext.Provider
      value={{
        subscription: subscription || null,
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
    throw new Error('useSubscription deve ser usado dentro de um SubscriptionProvider');
  }

  return context;
}