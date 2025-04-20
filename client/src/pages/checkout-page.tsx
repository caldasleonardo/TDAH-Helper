import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { FileText, ArrowLeft, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Inicializar Stripe
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Chave pública do Stripe (VITE_STRIPE_PUBLIC_KEY) não encontrada');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY, {
  // Habilitando o Google Pay nas opções do Stripe
  locale: 'pt-BR'
});

// Componente de formulário de pagamento Stripe
function CheckoutForm({ quizResultId, amount, clientSecret }: { quizResultId: string, amount: number, clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirm/${quizResultId}`,
        },
        redirect: 'if_required'
      });
      
      if (submitError) {
        setError(submitError.message || 'Ocorreu um erro ao processar o pagamento');
        setLoading(false);
      } else {
        // Pagamento confirmado com sucesso
        try {
          const paymentIntent = await stripe.retrievePaymentIntent(clientSecret);
          if (paymentIntent && paymentIntent.paymentIntent) {
            const res = await apiRequest('POST', '/api/payment-success', {
              paymentIntentId: paymentIntent.paymentIntent.id,
              quizResultId
            });
            
            if (res.ok) {
              toast({
                title: 'Pagamento realizado com sucesso!',
                description: 'Seu relatório premium já está disponível'
              });
              navigate(`/results/${quizResultId}`);
            } else {
              throw new Error('Erro ao atualizar o status do pagamento');
            }
          }
        } catch (err: any) {
          toast({
            variant: 'destructive',
            title: 'Erro ao confirmar pagamento',
            description: err.message
          });
        } finally {
          setLoading(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar o pagamento');
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4 mb-2">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">Relatório Completo</span>
            <span className="text-sm font-medium dark:text-white">R${(amount/100).toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
            <span>Avaliação detalhada com recomendações</span>
            <span>Pagamento único</span>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 dark:text-white">Método de Pagamento</h3>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="mr-2">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span className="text-sm">Agora com suporte a <strong>Google Pay</strong>!</span>
          </div>
          <PaymentElement 
            options={{
              wallets: {
                googlePay: 'always',
                applePay: 'auto',
              },
              fields: {
                billingDetails: {
                  name: 'auto',
                  email: 'auto',
                }
              },
              defaultValues: {
                billingDetails: {
                  name: user?.username || '',
                  email: user?.email || ''
                }
              }
            }}
          />
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-3 rounded-md text-sm flex items-start">
            <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full py-6 bg-purple-600 hover:bg-purple-700"
          disabled={!stripe || loading}
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </span>
          ) : (
            `Pagar R$${(amount/100).toFixed(2).replace('.', ',')}`
          )}
        </Button>
      </div>
    </form>
  );
}

// Componente para confirmar pagamento pela URL de retorno
function ConfirmPayment() {
  const { quizResultId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  useEffect(() => {
    const confirmPayment = async () => {
      if (!quizResultId) {
        setStatus('error');
        return;
      }
      
      // Obter o payment_intent e seu status da URL
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntentId = urlParams.get('payment_intent');
      const paymentStatus = urlParams.get('redirect_status');
      
      if (paymentStatus === 'succeeded' && paymentIntentId) {
        try {
          // Confirmar o pagamento no servidor
          const res = await apiRequest('POST', '/api/payment-success', {
            paymentIntentId,
            quizResultId
          });
          
          if (res.ok) {
            setStatus('success');
            toast({
              title: 'Pagamento confirmado!',
              description: 'Seu relatório premium já está disponível'
            });
            
            // Aguardar animação e redirecionar
            setTimeout(() => {
              navigate(`/results/${quizResultId}`);
            }, 2000);
          } else {
            throw new Error('Erro ao atualizar o status do pagamento');
          }
        } catch (error) {
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    };
    
    confirmPayment();
  }, [quizResultId, navigate, toast]);
  
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
          <Card className={status === 'success' 
            ? "border-green-200 dark:border-green-800" 
            : status === 'error' 
              ? "border-red-200 dark:border-red-800"
              : ""
          }>
            <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
              {status === 'loading' && (
                <>
                  <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-2 dark:text-white">Confirmando pagamento...</h2>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    Aguarde enquanto processamos seu pagamento.
                  </p>
                </>
              )}
              
              {status === 'success' && (
                <>
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 dark:text-white">Pagamento Realizado!</h2>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                    Seu relatório detalhado está pronto para visualização.
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    Redirecionando para o resultado...
                  </p>
                </>
              )}
              
              {status === 'error' && (
                <>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 dark:text-white">Falha no Pagamento</h2>
                  <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                    Ocorreu um erro ao confirmar seu pagamento. Por favor, tente novamente.
                  </p>
                  <Button onClick={() => navigate(`/checkout/${quizResultId}`)}>
                    Tentar Novamente
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}

// Página principal
export default function CheckoutPage() {
  const { quizResultId } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1290); // valor em centavos (R$ 12,90)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar URL
  if (window.location.pathname.includes('/checkout/confirm/')) {
    return <ConfirmPayment />;
  }
  
  // Obter a intenção de pagamento ao carregar a página
  useEffect(() => {
    const getPaymentIntent = async () => {
      if (!quizResultId) {
        setError('ID do resultado não encontrado');
        setLoading(false);
        return;
      }
      
      try {
        const res = await apiRequest('POST', '/api/create-payment-intent', { 
          quizResultId 
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Erro ao criar intenção de pagamento');
        }
        
        const data = await res.json();
        setClientSecret(data.clientSecret);
        setAmount(data.amount);
      } catch (err: any) {
        setError(err.message || 'Erro ao iniciar o pagamento');
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: err.message || 'Não foi possível iniciar o pagamento'
        });
      } finally {
        setLoading(false);
      }
    };
    
    getPaymentIntent();
  }, [quizResultId, toast]);
  
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
            onClick={() => navigate(`/results/${quizResultId}`)}
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
              {loading ? (
                <div className="py-10 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Preparando o checkout...
                  </p>
                </div>
              ) : error ? (
                <div className="py-6 text-center">
                  <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                    <p>{error}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/results/${quizResultId}`)}
                    className="mt-2"
                  >
                    Voltar aos resultados
                  </Button>
                </div>
              ) : clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#9333EA',
                        colorBackground: '#ffffff',
                        colorText: '#1f2937',
                        colorDanger: '#ef4444',
                        fontFamily: 'system-ui, sans-serif',
                        borderRadius: '6px',
                      },
                    },
                    // Opções adicionais do Stripe
                    locale: 'pt-BR',
                  }}
                >
                  <CheckoutForm 
                    quizResultId={quizResultId!} 
                    amount={amount}
                    clientSecret={clientSecret}
                  />
                </Elements>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}