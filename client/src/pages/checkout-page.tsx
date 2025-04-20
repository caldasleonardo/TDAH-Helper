import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useLocation } from "wouter";
import { CreditCard, Lock, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular processamento de pagamento
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Redirecionar após o pagamento bem-sucedido
      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    }, 1500);
  };
  
  if (success) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto"
          >
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2 dark:text-white">Pagamento Realizado!</h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  Seu relatório detalhado será enviado para seu e-mail em até 24 horas.
                </p>
                
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  Redirecionando para seu perfil...
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        
        <BottomNav />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          <Button 
            variant="ghost" 
            className="mb-4 p-0" 
            onClick={() => navigate("/results/1")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Relatório Detalhado TDAH
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">Relatório Completo</span>
                  <span className="text-sm font-medium dark:text-white">R$12,90</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Avaliação detalhada (30 questões)</span>
                  <span>Pagamento único</span>
                </div>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="email" className="text-sm">Email para envio</Label>
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue={user?.email || ""}
                      placeholder="seu-email@exemplo.com"
                      required
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="card" className="text-sm">Número do cartão</Label>
                      <CreditCard className="h-4 w-4 text-neutral-400" />
                    </div>
                    <Input 
                      id="card" 
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-sm">Validade</Label>
                      <Input 
                        id="expiry" 
                        placeholder="MM/AA"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="cvc" className="text-sm">CVC</Label>
                        <Lock className="h-3 w-3 text-neutral-400" />
                      </div>
                      <Input 
                        id="cvc" 
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="name" className="text-sm">Nome no cartão</Label>
                    <Input 
                      id="name" 
                      placeholder="NOME COMPLETO"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-6 bg-purple-600 hover:bg-purple-700"
                  disabled={loading}
                >
                  {loading ? "Processando..." : "Pagar R$12,90"}
                </Button>
                
                <div className="flex items-center justify-center mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                  <Lock className="h-3 w-3 mr-1" /> Pagamento seguro
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}