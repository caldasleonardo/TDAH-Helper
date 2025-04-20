import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { QuizProvider } from "@/hooks/use-quiz";
import { QuestionCard } from "@/components/quiz/question-card";
import { ProgressBar } from "@/components/quiz/progress-bar";
import { useQuiz } from "@/hooks/use-quiz";

function QuizContent() {
  const { progress } = useQuiz();
  
  return (
    <div className="max-w-md mx-auto">
      <ProgressBar value={progress} className="mb-6" />
      <QuestionCard />
      
      <p className="text-neutral-500 dark:text-neutral-400 text-sm text-center mt-4">
        Você pode pausar o quiz a qualquer momento e continuar mais tarde.
      </p>
    </div>
  );
}

export default function QuizPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
        <QuizProvider>
          <QuizContent />
        </QuizProvider>
      </main>
      
      <BottomNav />
    </div>
  );
}
