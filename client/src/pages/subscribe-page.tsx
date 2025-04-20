import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSubscription } from '@/hooks/use-subscription';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function SubscriptionForm() {
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { createSubscriptionMutation } = useSubscription();
  const [, navigate] = useLocation();

  const handleStartSubscription = async () => {
    setIsLoading(true);
    try {
      const result = await createSubscriptionMutation.mutateAsync({ planType });
      if (result.clientSecret) {
        setClientSecret(result.clientSecret);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (clientSecret) {
    return <CheckoutForm clientSecret={clientSecret} />;
  }

  return (
    <div className="max-w-md mx-auto">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/premium')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Escolha seu plano Premium</CardTitle>
          <CardDescription>
            Selecione o plano que melhor atende às suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={planType} onValueChange={(value) => setPlanType(value as 'monthly' | 'yearly')}>
            <div className="flex items-center space-x-2 space-y-0 mb-4 border rounded-lg p-4 hover:border-primary cursor-pointer" onClick={() => setPlanType('monthly')}>
              <RadioGroupItem value="monthly" id="monthly" />
              <div className="grid gap-1 flex-1">
                <Label htmlFor="monthly" className="font-medium cursor-pointer">Plano Mensal</Label>
                <div className="text-sm text-muted-foreground">R$ 19,90 por mês</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-y-0 border rounded-lg p-4 hover:border-primary cursor-pointer" onClick={() => setPlanType('yearly')}>
              <RadioGroupItem value="yearly" id="yearly" />
              <div className="grid gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="yearly" className="font-medium cursor-pointer">Plano Anual</Label>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-green-800 dark:text-green-100">Melhor oferta</span>
                </div>
                <div className="text-sm text-muted-foreground">R$ 199,90 por ano (2 meses grátis)</div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/premium')}>
            Cancelar
          </Button>
          <Button onClick={handleStartSubscription} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Continuar'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/premium`,
      },
    });

    if (error) {
      setMessage(error.message || 'Ocorreu um erro ao processar o pagamento.');
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/premium')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Finalizar assinatura</CardTitle>
          <CardDescription>
            Insira seus dados de pagamento para completar a assinatura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement />
            {message && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {message}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => navigate('/premium')}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="payment-form" 
            disabled={isLoading || !stripe || !elements}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Pagar e Assinar'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function SubscribePage() {
  const { isPremium } = useSubscription();
  const [, navigate] = useLocation();

  // Se já for premium, redireciona para a página de premium
  useEffect(() => {
    if (isPremium) {
      navigate('/premium');
    }
  }, [isPremium, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">Assinatura Premium</h1>
          
          {isPremium === null ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Carregando" />
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{}} key="subscription-element">
              <SubscriptionForm />
            </Elements>
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}