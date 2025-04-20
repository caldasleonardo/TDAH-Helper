import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useSubscription, type PremiumFeature } from '@/hooks/use-subscription';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Star, Clock, PackageCheck, DollarSign } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';

export default function PremiumPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { 
    premiumFeatures, 
    isLoadingFeatures, 
    userPremiumFeatures, 
    isLoadingUserFeatures,
    subscription,
    isPremium
  } = useSubscription();

  if (isLoadingFeatures || isLoadingUserFeatures) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Carregando" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Assinatura Premium</h1>
          <p className="text-muted-foreground mt-2">
            Desbloqueie recursos exclusivos para gerenciar sua saúde mental
          </p>
        </div>

        {isPremium ? (
          <div className="mb-8">
            <Card className="bg-primary/10 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Membro Premium</span>
                </CardTitle>
                <CardDescription>
                  Você tem acesso a todos os recursos premium
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscription && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Plano {subscription.planType === 'monthly' ? 'Mensal' : 'Anual'} - 
                        Renova em {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Status: {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {subscription?.status === 'active' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (confirm('Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso aos recursos premium no final do período atual.')) {
                        // Implementar cancelamento quando o usuário decidir
                      }
                    }}
                  >
                    Cancelar Assinatura
                  </Button>
                )}
                {subscription?.status !== 'active' && (
                  <Button onClick={() => navigate('/premium/subscribe')}>
                    Renovar Assinatura
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Assine o plano Premium</CardTitle>
                <CardDescription>
                  Obtenha acesso a recursos exclusivos por apenas R$ 19,90/mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Com o plano premium, você tem acesso a todos os recursos avançados da nossa plataforma,
                  incluindo relatórios detalhados, consultas com especialistas e muito mais.
                </p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Também disponível no plano anual por R$ 199,90 (2 meses grátis)
                  </span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => navigate('/premium/subscribe')}>
                  Assinar Agora
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        <h2 className="text-2xl font-bold tracking-tight mt-10 mb-6">Recursos Premium</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumFeatures.map((feature) => (
            <Card key={feature.id} className={isPremium ? "border-primary/50" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{feature.name}</span>
                  {isPremium ? (
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary">
                      Desbloqueado
                    </Badge>
                  ) : (
                    <Badge variant="outline">Bloqueado</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{feature.description}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-sm flex items-center gap-2">
                  {isPremium ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Disponível</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Assine para desbloquear</span>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

      </main>
      
      <BottomNav />
    </div>
  );
}