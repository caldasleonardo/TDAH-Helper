import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CheckIcon, LockOpen, LightbulbIcon, BrainIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-md mx-auto">
            <Card className="bg-white dark:bg-neutral-800 rounded-xl shadow-md overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-center mb-8">
                  <div className="h-28 w-28 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-full">
                    <BrainIcon className="h-14 w-14 text-primary" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">
                  Bem-vindo ao TDAH Helper
                </h2>
                
                <p className="text-neutral-600 dark:text-neutral-300 text-center mb-6">
                  Este quiz ajuda a identificar possíveis sinais de TDAH baseados em critérios do DSM-5. Lembre-se que isto não é um diagnóstico clínico, apenas uma ferramenta de autoconhecimento.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                      <CheckIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium dark:text-white">Quiz Personalizado</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">15-30 perguntas para avaliar possíveis indícios</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                      <LockOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium dark:text-white">Privacidade</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">Suas respostas são confidenciais</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                      <LightbulbIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium dark:text-white">Insights Práticos</h3>
                      <p className="text-neutral-600 dark:text-neutral-400">Recomendações personalizadas baseadas no resultado</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Link href={user ? "/quiz" : "/auth"}>
                    <Button className="w-full py-6 text-base">
                      {user ? "Começar Quiz" : "Entrar para começar"}
                    </Button>
                  </Link>
                  
                  {!user && (
                    <>
                      <div className="relative flex items-center justify-center">
                        <hr className="flex-grow border-neutral-200 dark:border-neutral-700" />
                        <span className="mx-4 text-sm text-neutral-500 dark:text-neutral-400">ou faça login</span>
                        <hr className="flex-grow border-neutral-200 dark:border-neutral-700" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="flex justify-center items-center py-5">
                          <i className="fab fa-google mr-2 text-neutral-600 dark:text-neutral-400"></i>
                          <span>Google</span>
                        </Button>
                        <Button variant="outline" className="flex justify-center items-center py-5">
                          <i className="fab fa-apple mr-2 text-neutral-600 dark:text-neutral-400"></i>
                          <span>Apple</span>
                        </Button>
                      </div>
                    </>
                  )}
                  
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                    Ao continuar, você concorda com nossos <a href="#" className="text-primary hover:underline">Termos de Uso</a> e <a href="#" className="text-primary hover:underline">Política de Privacidade</a>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
