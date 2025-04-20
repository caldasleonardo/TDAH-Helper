import { createContext, ReactNode, useContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { questions } from "@/lib/quiz-data";
import { useAuth } from "./use-auth";
import { useLocation } from "wouter";

type QuizContextType = {
  currentQuestion: number;
  totalQuestions: number;
  questions: typeof questions;
  answers: Record<number, number>;
  isComplete: boolean;
  progress: number;
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
      // Simplified scoring: max possible score would be 3 * totalQuestions
      const maxPossibleScore = 3 * totalQuestions;
      const scorePercentage = (totalScore / maxPossibleScore) * 100;
      
      let category = "low";
      if (scorePercentage >= 70) {
        category = "high";
      } else if (scorePercentage >= 40) {
        category = "moderate";
      }
      
      const quizResult = {
        userId: user?.id,
        score: totalScore,
        category,
        answers,
        inattentionScore,
        hyperactivityScore,
        impulsivityScore,
        date: new Date(),
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
