import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { QuizProvider } from "@/hooks/use-quiz";
import { QuestionCard } from "@/components/quiz/question-card";
import { ProgressBar } from "@/components/quiz/progress-bar";
import { SectionProgressBars } from "@/components/quiz/section-progress-bars";
import { useQuiz } from "@/hooks/use-quiz";
import { motion } from "framer-motion";

function QuizContent() {
  const { progress, sectionProgress, currentQuestionType } = useQuiz();
  
  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-2"
      >
        <h2 className="text-lg font-semibold text-center">
          Avaliação de TDAH
        </h2>
      </motion.div>
      
      <div className="mb-4">
        <ProgressBar value={progress} className="mb-1.5" />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <SectionProgressBars 
            sections={sectionProgress}
            currentType={currentQuestionType}
          />
        </motion.div>
      </div>
      
      <QuestionCard />
      
      <p className="text-neutral-500 dark:text-neutral-400 text-xs text-center mt-3">
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
