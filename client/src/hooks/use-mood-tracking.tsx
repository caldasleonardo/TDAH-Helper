import { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useAuth } from "./use-auth";

// Definir tipos para o registro de humor
export type MoodType = "happy" | "calm" | "sad" | "angry" | "anxious" | "tired" | "energetic" | "focused";

export type Mood = {
  id: number;
  userId: number;
  mood: MoodType;
  intensity: number; // 1-5
  note?: string;
  recordedAt: string;
  createdAt: string;
};

export type MoodInput = Omit<Mood, "id" | "userId" | "createdAt">;

export type MoodStats = {
  period: "day" | "week" | "month" | "year";
  totalRecords: number;
  moodStats: {
    mood: string;
    count: number;
    percentage: number;
    averageIntensity: number;
  }[];
  trendData: {
    date: string;
    predominantMood: string;
    averageIntensity: number;
    moodCount: number;
  }[];
};

type MoodTrackingContextType = {
  moods: Mood[];
  isLoadingMoods: boolean;
  moodStats: MoodStats | null;
  isLoadingStats: boolean;
  createMoodMutation: UseMutationResult<Mood, Error, MoodInput>;
  deleteMoodMutation: UseMutationResult<any, Error, number>;
  refreshMoods: () => void;
  setActivePeriod: (period: "day" | "week" | "month" | "year") => void;
  activePeriod: "day" | "week" | "month" | "year";
};

export const MoodTrackingContext = createContext<MoodTrackingContextType | null>(null);

export function MoodTrackingProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activePeriod, setActivePeriod] = useState<"day" | "week" | "month" | "year">("week");

  // Buscar registros de humor
  const {
    data: moods = [],
    isLoading: isLoadingMoods,
    refetch: refreshMoods,
  } = useQuery<Mood[]>({
    queryKey: ["/api/mood-tracking"],
    enabled: !!user,
  });

  // Buscar estatísticas de humor
  const {
    data: moodStats,
    isLoading: isLoadingStats,
  } = useQuery<MoodStats>({
    queryKey: ["/api/mood-tracking/stats", activePeriod],
    enabled: !!user,
  });

  // Mutação para criar um novo registro de humor
  const createMoodMutation = useMutation({
    mutationFn: async (moodData: MoodInput) => {
      const res = await apiRequest("POST", "/api/mood-tracking", moodData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Humor registrado",
        description: "Seu registro de humor foi salvo com sucesso!",
      });
      
      // Invalidar consultas para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ["/api/mood-tracking"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mood-tracking/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar humor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutação para deletar um registro de humor
  const deleteMoodMutation = useMutation({
    mutationFn: async (moodId: number) => {
      const res = await apiRequest("DELETE", `/api/mood-tracking/${moodId}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registro excluído",
        description: "Seu registro de humor foi excluído com sucesso!",
      });
      
      // Invalidar consultas para atualizar os dados
      queryClient.invalidateQueries({ queryKey: ["/api/mood-tracking"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mood-tracking/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <MoodTrackingContext.Provider
      value={{
        moods,
        isLoadingMoods,
        moodStats,
        isLoadingStats,
        createMoodMutation,
        deleteMoodMutation,
        refreshMoods,
        setActivePeriod,
        activePeriod,
      }}
    >
      {children}
    </MoodTrackingContext.Provider>
  );
}

export function useMoodTracking() {
  const context = useContext(MoodTrackingContext);
  if (!context) {
    throw new Error("useMoodTracking must be used within a MoodTrackingProvider");
  }
  return context;
}