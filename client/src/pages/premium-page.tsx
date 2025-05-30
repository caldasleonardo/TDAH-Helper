import { useState } from "react";
import { useLocation } from "wouter";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Star, 
  Shield, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Book, 
  Timer,
  Calendar as CalendarIcon,
  UserIcon,
  FileText,
  Brain,
  LineChart,
  History,
  ScrollText,
  Sparkles,
  Trophy,
  Users,
  VideoIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PremiumPage() {
  const [activeTab, setActiveTab] = useState<string>("features");
  const { user } = useAuth();
  const { 
    premiumFeatures, 
    isLoadingFeatures,
    subscription,
    isLoadingSubscription,
    userPremiumFeatures,
    isLoadingUserFeatures,
    isPremium
  } = useSubscription();
  
  const [, setLocation] = useLocation();
  
  // Redirecionar para a página de assinatura
  const handleSubscribe = () => {
    setLocation("/subscribe");
  };
  
  // Função para formatar data
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  if (isLoadingFeatures || isLoadingSubscription || isLoadingUserFeatures) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
        <p className="text-neutral-600 dark:text-neutral-400">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mb-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Premium</h1>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-auto" 
            onClick={() => setLocation("/profile")}
          >
            <UserIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-2 flex items-center">
          <Star className="text-primary h-7 w-7 mr-2" />
          <h2 className="text-2xl font-bold">Recursos Premium</h2>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl text-sm">
          Desbloqueie todo o potencial do TDAH Focus com recursos premium para entender melhor o TDAH e gerenciar seus sintomas de forma eficaz.
        </p>
      </div>
      
      {isPremium ? (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <CheckCircle className="h-6 w-6 text-primary mr-2" />
            <div>
              <h3 className="font-medium">Assinatura Premium Ativa</h3>
              {subscription && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Válida até {formatDate(subscription.currentPeriodEnd)}
                </p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="border-primary bg-primary/5 text-primary">
            {subscription?.planType === 'monthly' ? 'Mensal' : 'Anual'}
          </Badge>
        </div>
      ) : (
        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 mb-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Shield className="h-6 w-6 text-neutral-600 dark:text-neutral-400 mr-2" />
            <div>
              <h3 className="font-medium">Assinatura Premium</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Assine para ter acesso a todos os recursos premium
              </p>
            </div>
          </div>
          <Button onClick={handleSubscribe} className="w-full md:w-auto">
            Assinar Agora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
      
      <Tabs defaultValue="features" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="features">Recursos Premium</TabsTrigger>
          <TabsTrigger value="subscription">Minha Assinatura</TabsTrigger>
        </TabsList>
        
        <TabsContent value="features" className="mt-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Principais Recursos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {premiumFeatures.map((feature) => {
                // Escolha o ícone com base no ID do recurso
                let FeatureIcon;
                switch(feature.id) {
                  case 1:
                    FeatureIcon = FileText;
                    break;
                  case 2:
                    FeatureIcon = Brain;
                    break;
                  case 3:
                    FeatureIcon = LineChart;
                    break;
                  case 4:
                    FeatureIcon = History;
                    break;
                  case 5:
                    FeatureIcon = ScrollText;
                    break;
                  case 6:
                    FeatureIcon = VideoIcon;
                    break;
                  case 7:
                    FeatureIcon = Trophy;
                    break;
                  case 8:
                    FeatureIcon = Users;
                    break;
                  default:
                    FeatureIcon = Sparkles;
                }
                
                return (
                  <Card key={feature.id} className={`h-full ${isPremium ? 'border-primary/30 hover:shadow-md transition-shadow' : ''}`}>
                    <CardHeader className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <FeatureIcon className="h-5 w-5 text-primary" />
                        </div>
                        {isPremium && <CheckCircle className="h-4 w-4 text-primary" />}
                      </div>
                      <CardTitle className="text-sm">
                        {feature.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription className="text-xs">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                    <CardFooter className="p-3 pt-0 flex justify-between items-center">
                      {isPremium ? (
                        <>
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs py-0">
                            Disponível
                          </Badge>
                          {feature.id === 1 && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-primary h-7 text-xs"
                              onClick={() => setLocation("/premium-content")}
                            >
                              Acessar <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <Badge variant="outline" className="text-xs py-0">
                          Premium
                        </Badge>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
          
          {isPremium && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Conteúdo Exclusivo</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation("/premium-content")}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Book className="h-6 w-6 text-primary p-1 bg-primary/10 rounded-lg" />
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs py-0">
                        Premium
                      </Badge>
                    </div>
                    <CardTitle className="text-sm mt-1">Conteúdo Premium</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Artigos exclusivos e guias sobre TDAH
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <Button variant="link" className="p-0 h-auto text-primary text-xs">
                      Ver conteúdo <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation("/premium-tools/pomodoro")}
                >
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Timer className="h-6 w-6 text-primary p-1 bg-primary/10 rounded-lg" />
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs py-0">
                        Premium
                      </Badge>
                    </div>
                    <CardTitle className="text-sm mt-1">Pomodoro para TDAH</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Ferramenta de foco adaptada para TDAH
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <Button variant="link" className="p-0 h-auto text-primary text-xs">
                      Usar ferramenta <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="opacity-70 bg-neutral-50 dark:bg-neutral-900 hover:opacity-100 transition-opacity">
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <CalendarIcon className="h-6 w-6 text-primary p-1 bg-primary/10 rounded-lg" />
                      <Badge variant="outline" className="text-xs py-0">
                        Em breve
                      </Badge>
                    </div>
                    <CardTitle className="text-sm mt-1">Consultas Especializadas</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Agende consultas com especialistas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <Button variant="link" className="p-0 h-auto text-neutral-500 text-xs" disabled>
                      Disponível em breve
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {!isPremium && (
            <div className="flex justify-center mt-8">
              <Button onClick={handleSubscribe} className="px-8 py-6" size="lg">
                Assinar Premium
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="subscription" className="mt-4">
          {isPremium && subscription ? (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle>Detalhes da Assinatura</CardTitle>
                <CardDescription>
                  Informações sobre sua assinatura premium
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Plano</span>
                    <span className="font-medium">
                      {subscription.planType === 'monthly' ? 'Plano Mensal' : 'Plano Anual'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Status</span>
                    <Badge 
                      variant={subscription.status === 'active' ? 'default' : 'outline'}
                      className={subscription.status === 'active' ? 'bg-green-500' : ''}
                    >
                      {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Data de início</span>
                    <span className="font-medium">{formatDate(subscription.currentPeriodStart)}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-neutral-600 dark:text-neutral-400">Próxima cobrança</span>
                    <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => window.open('https://dashboard.stripe.com/billing', '_blank')}>
                  Gerenciar pagamento
                </Button>
                <Button variant="destructive">
                  Cancelar assinatura
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Sem assinatura ativa</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                Você ainda não possui uma assinatura premium. Assine agora para desbloquear todos os recursos exclusivos.
              </p>
              <Button onClick={handleSubscribe}>
                Assinar Premium
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <BottomNav />
    </div>
  );
}