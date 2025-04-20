import { useState } from "react";
import { useLocation } from "wouter";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStripe, useElements, PaymentElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, CheckIcon, ArrowLeft, StarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Inicializar o Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Chave pública do Stripe não configurada');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Formulário de checkout para o pagamento da assinatura
function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Função para obter mensagens de erro mais amigáveis
  const getErrorMessage = (error: any): string => {
    console.log("Erro Stripe:", error);
    
    switch (error.code) {
      case 'card_declined':
        return 'O cartão foi recusado. Por favor, verifique as informações ou tente outro método de pagamento.';
      case 'expired_card':
        return 'O cartão está expirado. Por favor, tente outro cartão.';
      case 'incorrect_number':
        return 'O número do cartão está incorreto. Por favor, verifique e tente novamente.';
      case 'incomplete_number':
        return 'Número do cartão incompleto. Por favor, preencha todos os dados do cartão.';
      case 'incomplete_expiry':
        return 'Data de expiração incompleta. Por favor, verifique e tente novamente.';
      case 'incomplete_cvc':
        return 'Código de segurança (CVC) incompleto. Por favor, verifique e tente novamente.';
      case 'resource_missing':
        return 'Tivemos um problema com a configuração da assinatura. Estamos trabalhando para resolver.';
      default:
        return error.message || 'Ocorreu um erro ao processar o pagamento.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/premium", // Redireciona para a página premium após o pagamento
        },
      });

      if (error) {
        const message = getErrorMessage(error);
        setErrorMessage(message);
        toast({
          title: "Erro no pagamento",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro na assinatura:", error);
      const message = error.message || "Ocorreu um erro ao processar o pagamento.";
      setErrorMessage(message);
      toast({
        title: "Erro no pagamento",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 rounded-md text-sm text-red-600 dark:text-red-400">
          <p className="font-medium mb-1">Erro no pagamento</p>
          <p>{errorMessage}</p>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          "Confirmar Pagamento"
        )}
      </Button>
    </form>
  );
}

// Componente principal da página de assinatura
export default function SubscribePage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { createSubscriptionMutation, isPremium } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [errorSubscription, setErrorSubscription] = useState<string | null>(null);
  
  const handleSubscribe = async () => {
    setErrorSubscription(null);
    
    try {
      // Iniciar processo de assinatura com o plano selecionado
      const result = await createSubscriptionMutation.mutateAsync({ planType: selectedPlan });
      setClientSecret(result.clientSecret);
    } catch (error: any) {
      console.error("Erro ao criar assinatura:", error);
      const errorMessage = error.message || "Não foi possível iniciar o processo de assinatura.";
      setErrorSubscription(errorMessage);
      toast({
        title: "Erro ao criar assinatura",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    setLocation("/premium");
  };

  if (isLoadingAuth) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  if (isPremium) {
    setLocation("/premium");
    return null;
  }

  return (
    <div className="container mx-auto p-4 mb-20">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0" 
        onClick={handleGoBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-2 flex items-center">
          <StarIcon className="text-primary h-8 w-8 mr-2" />
          <h1 className="text-3xl font-bold">Assinar Premium</h1>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Escolha o plano ideal para você e tenha acesso a todos os recursos premium do TDAH Focus.
        </p>
      </div>

      {!clientSecret ? (
        <div className="max-w-3xl mx-auto">
          <Tabs 
            defaultValue="monthly" 
            className="mb-8"
            value={selectedPlan}
            onValueChange={(value) => setSelectedPlan(value as 'monthly' | 'yearly')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="monthly">Plano Mensal</TabsTrigger>
              <TabsTrigger value="yearly">Plano Anual (20% de desconto)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Plano Mensal</span>
                    <span className="text-primary">R$ 19,90/mês</span>
                  </CardTitle>
                  <CardDescription>
                    Acesso a todos os recursos premium com renovação mensal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Relatórios detalhados de TDAH com insights avançados</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Acesso a todos os artigos e conteúdos educacionais premium</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Ferramentas de produtividade personalizadas para TDAH</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Histórico completo de testes e acompanhamento de progresso</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Cancele a qualquer momento</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setSelectedPlan('monthly');
                      handleSubscribe();
                    }}
                    disabled={createSubscriptionMutation.isPending}
                  >
                    {createSubscriptionMutation.isPending && selectedPlan === 'monthly' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Assinar Plano Mensal"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="yearly">
              <Card className="border-primary">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <span>Plano Anual</span>
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-neutral-500 line-through text-sm">R$ 238,80/ano</div>
                      <div className="text-primary font-bold">R$ 191,04/ano</div>
                      <div className="text-sm text-neutral-600">Equivalente a R$ 15,92/mês</div>
                    </div>
                  </div>
                  <CardDescription>
                    Economize 20% com o plano anual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Todos os benefícios do plano mensal</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Economia de 20% em comparação ao plano mensal</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Prioridade no acesso a novos recursos</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-primary mr-2 mt-0.5" />
                      <span>Preço garantido por 1 ano</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => {
                      setSelectedPlan('yearly');
                      handleSubscribe();
                    }}
                    disabled={createSubscriptionMutation.isPending}
                  >
                    {createSubscriptionMutation.isPending && selectedPlan === 'yearly' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Assinar Plano Anual"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          {errorSubscription && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-4 rounded-md mb-4 text-sm text-red-600 dark:text-red-400">
              <p className="font-medium mb-1">Erro ao criar assinatura</p>
              <p>{errorSubscription}</p>
              <p className="mt-2 text-xs">Se o problema persistir, entre em contato com nosso suporte.</p>
            </div>
          )}
          
          <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Ao assinar, você concorda com nossos <a href="#" className="text-primary underline">Termos de Serviço</a> e <a href="#" className="text-primary underline">Política de Privacidade</a>.
          </div>
        </div>
      ) : (
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Finalize sua assinatura</CardTitle>
              <CardDescription>
                Insira os dados de pagamento para concluir sua assinatura {selectedPlan === 'monthly' ? 'mensal' : 'anual'}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} />
              </Elements>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}