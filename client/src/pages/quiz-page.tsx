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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-2 text-center">
          Avaliação de TDAH
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4 text-center text-sm">
          Responda conforme sua experiência nos últimos 6 meses
        </p>
      </motion.div>
      
      <ProgressBar value={progress} className="mb-3" />
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <SectionProgressBars 
          sections={sectionProgress}
          currentType={currentQuestionType}
          className="mb-6"
        />
      </motion.div>
      
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
