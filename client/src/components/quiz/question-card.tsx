import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuiz } from "@/hooks/use-quiz";
import { answerOptions } from "@/lib/quiz-data";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function QuestionCard() {
  const {
    currentQuestion,
    totalQuestions,
    questions,
    answers,
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    submitQuiz,
    isComplete,
    isSubmitting
  } = useQuiz();
  
  const question = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardContent className="p-6 md:p-8">
            <div>
              <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                Pergunta {currentQuestion + 1} de {totalQuestions}
              </h2>
              <h3 className="text-xl font-semibold mb-6 dark:text-neutral-100">
                {question.text}
              </h3>
              
              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(value) => selectAnswer(currentQuestion, parseInt(value))}
                className="space-y-3 mb-6"
              >
                {answerOptions.map((option) => (
                  <div 
                    key={option.value}
                    className={cn(
                      "flex items-center space-x-2 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 transition-colors",
                      selectedAnswer === option.value && "border-primary bg-primary/5 dark:bg-primary/10"
                    )}
                  >
                    <RadioGroupItem 
                      id={`option-${option.value}`} 
                      value={option.value.toString()} 
                      className="hidden"
                    />
                    <div 
                      className={cn(
                        "h-5 w-5 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center",
                        selectedAnswer === option.value && "border-primary"
                      )}
                    >
                      {selectedAnswer === option.value && (
                        <CheckIcon className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <Label 
                      htmlFor={`option-${option.value}`}
                      className="flex-1 cursor-pointer dark:text-neutral-200"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestion === 0}
              >
                <span className="mr-2">←</span>
                Anterior
              </Button>
              
              {!isLastQuestion || !isComplete ? (
                <Button
                  onClick={goToNextQuestion}
                  disabled={selectedAnswer === undefined}
                >
                  {isLastQuestion ? 'Finalizar' : 'Próxima'}
                  <span className="ml-2">→</span>
                </Button>
              ) : (
                <Button 
                  onClick={submitQuiz}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Ver resultados'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
