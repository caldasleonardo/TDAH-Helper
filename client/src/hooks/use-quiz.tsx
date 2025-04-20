import { createContext, ReactNode, useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { questions } from "@/lib/quiz-data";
import { useAuth } from "./use-auth";
import { useLocation } from "wouter";

type SectionProgress = {
  inattention: {
    total: number;
    answered: number;
    percentage: number;
  };
  hyperactivity: {
    total: number;
    answered: number;
    percentage: number;
  };
  impulsivity: {
    total: number;
    answered: number;
    percentage: number;
  };
};

type QuizContextType = {
  currentQuestion: number;
  totalQuestions: number;
  questions: typeof questions;
  answers: Record<number, number>;
  isComplete: boolean;
  progress: number;
  sectionProgress: SectionProgress;
  currentQuestionType: string;
  selectAnswer: (questionIndex: number, answerValue: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  isSubmitting: boolean;
};

const QuizContext = createContext<QuizContextType | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const currentQuestionType = questions[currentQuestion]?.type || '';
  
  // Calculate progress for each section
  const calculateSectionProgress = (): SectionProgress => {
    // Count total questions by type
    const totalByType = questions.reduce((acc, question) => {
      acc[question.type] = (acc[question.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Count answered questions by type
    const answeredByType = Object.keys(answers).reduce((acc, questionIndex) => {
      const questionType = questions[parseInt(questionIndex)].type;
      acc[questionType] = (acc[questionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate percentages
    return {
      inattention: {
        total: totalByType.inattention || 0,
        answered: answeredByType.inattention || 0,
        percentage: totalByType.inattention 
          ? ((answeredByType.inattention || 0) / totalByType.inattention) * 100 
          : 0
      },
      hyperactivity: {
        total: totalByType.hyperactivity || 0,
        answered: answeredByType.hyperactivity || 0,
        percentage: totalByType.hyperactivity 
          ? ((answeredByType.hyperactivity || 0) / totalByType.hyperactivity) * 100 
          : 0
      },
      impulsivity: {
        total: totalByType.impulsivity || 0,
        answered: answeredByType.impulsivity || 0,
        percentage: totalByType.impulsivity 
          ? ((answeredByType.impulsivity || 0) / totalByType.impulsivity) * 100 
          : 0
      }
    };
  };
  
  const sectionProgress = calculateSectionProgress();
  
  // Submit quiz results mutation
  const { mutate: submitQuizMutation, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      // Calculate scores
      let totalScore = 0;
      let inattentionScore = 0;
      let hyperactivityScore = 0;
      let impulsivityScore = 0;
      
      Object.entries(answers).forEach(([questionIndexStr, value]) => {
        const questionIndex = parseInt(questionIndexStr);
        const question = questions[questionIndex];
        totalScore += value;
        
        if (question.type === "inattention") {
          inattentionScore += value;
        } else if (question.type === "hyperactivity") {
          hyperactivityScore += value;
        } else if (question.type === "impulsivity") {
          impulsivityScore += value;
        }
      });
      
      // Determine category based on score
      // Calculando percentuais para cada tipo
      const maxInattentionScore = 9 * 3; // 9 perguntas * 3 (pontuação máxima)
      const maxHyperactivityScore = 3 * 3; // 3 perguntas * 3
      const maxImpulsivityScore = 5 * 3; // 5 perguntas * 3
      
      const inattentionPercentage = (inattentionScore / maxInattentionScore) * 100;
      const hyperactivityPercentage = (hyperactivityScore / maxHyperactivityScore) * 100;
      const impulsivityPercentage = (impulsivityScore / maxImpulsivityScore) * 100;
      
      // Pontuação total
      const maxPossibleScore = 3 * totalQuestions;
      const scorePercentage = (totalScore / maxPossibleScore) * 100;
      
      // Determinando categoria com base nos percentuais
      let category = "low";
      
      // Verificando se o usuário selecionou "sempre" para a maioria das perguntas
      const maxPossibleAnswerValue = 3; // valor da resposta "sempre"
      const totalAnswers = Object.keys(answers).length;
      const totalHighAnswers = Object.values(answers).filter(value => value === maxPossibleAnswerValue).length;
      const highAnswersPercentage = (totalHighAnswers / totalAnswers) * 100;
      
      // Se 65% ou mais das respostas forem "sempre", automaticamente classificamos como alto
      if (highAnswersPercentage >= 65) {
        category = "high";
      }
      // Se qualquer área tiver um percentual alto, a categoria será alta
      else if (inattentionPercentage >= 70 || hyperactivityPercentage >= 70 || impulsivityPercentage >= 70) {
        category = "high";
      } 
      // Se pelo menos duas áreas tiverem percentual moderado-alto, a categoria será alta
      else if (
        (inattentionPercentage >= 60 && hyperactivityPercentage >= 60) || 
        (inattentionPercentage >= 60 && impulsivityPercentage >= 60) || 
        (hyperactivityPercentage >= 60 && impulsivityPercentage >= 60)
      ) {
        category = "high";
      }
      // Se o percentual total for alto, a categoria será alta
      else if (scorePercentage >= 60) {
        category = "high";
      }
      // Categoria moderada
      else if (
        inattentionPercentage >= 45 || 
        hyperactivityPercentage >= 45 || 
        impulsivityPercentage >= 45 || 
        scorePercentage >= 35
      ) {
        category = "moderate";
      }
      
      // Converter o objeto answers para uma string JSON
      const answersJson = JSON.stringify(answers);
      
      const quizResult = {
        userId: user?.id,
        score: totalScore,
        category,
        answers: answersJson,
        inattentionScore,
        hyperactivityScore,
        impulsivityScore,
        // Não enviar a data, deixar o servidor definir com defaultNow()
      };
      
      const res = await apiRequest("POST", "/api/quiz-results", quizResult);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Quiz concluído!",
        description: "Seus resultados estão prontos.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-results"] });
      navigate(`/results/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar resultados",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Quiz functions
  const selectAnswer = (questionIndex: number, answerValue: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerValue,
    }));
  };
  
  const goToNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const submitQuiz = () => {
    if (Object.keys(answers).length === totalQuestions) {
      submitQuizMutation();
    } else {
      toast({
        title: "Quiz incompleto",
        description: "Por favor, responda todas as perguntas antes de enviar.",
        variant: "destructive",
      });
    }
  };
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsComplete(false);
  };
  
  return (
    <QuizContext.Provider
      value={{
        currentQuestion,
        totalQuestions,
        questions,
        answers,
        isComplete,
        progress,
        sectionProgress,
        currentQuestionType,
        selectAnswer,
        goToNextQuestion,
        goToPreviousQuestion,
        submitQuiz,
        resetQuiz,
        isSubmitting,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
