import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useSubscription } from "@/hooks/use-subscription";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { LockIcon, BookIcon, VideoIcon, FileTextIcon, PencilRulerIcon, CalendarIcon, StarIcon, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Definição dos tipos para conteúdo premium
type PremiumContentBlock = {
  type: 'paragraph' | 'subtitle' | 'list' | 'video' | 'tool' | 'consultation';
  text?: string;
  items?: string[];
  url?: string;
  description?: string;
};

type PremiumArticle = {
  id: number;
  title: string;
  description: string;
  category: 'education' | 'productivity' | 'consultation';
  icon: typeof BookIcon | typeof VideoIcon | typeof FileTextIcon | typeof PencilRulerIcon | typeof CalendarIcon;
  content: PremiumContentBlock[];
  isPremium: boolean;
};

// Conteúdo premium exclusivo
const premiumContent: PremiumArticle[] = [
  {
    id: 1,
    title: "Estratégias Avançadas para TDAH no Trabalho",
    description: "Técnicas específicas para aumentar produtividade e foco no ambiente profissional",
    category: "productivity",
    icon: PencilRulerIcon,
    isPremium: true,
    content: [
      {
        type: "paragraph",
        text: "Profissionais com TDAH enfrentam desafios únicos no ambiente de trabalho. Este guia apresenta estratégias baseadas em evidências para maximizar sua produtividade profissional."
      },
      {
        type: "subtitle",
        text: "Organização do Ambiente de Trabalho"
      },
      {
        type: "paragraph",
        text: "O ambiente físico tem um impacto significativo na capacidade de concentração. Considere estas estratégias para otimizar seu espaço:"
      },
      {
        type: "list",
        items: [
          "Elimine distrações visuais e sonoras mantendo sua mesa organizada",
          "Utilize fones de ouvido com cancelamento de ruído",
          "Implemente o sistema de cores para categorizar tarefas e projetos",
          "Mantenha apenas o material relevante à tarefa atual visível"
        ]
      },
      {
        type: "tool",
        text: "Pomodoro Avançado",
        description: "Esta ferramenta permite personalizar intervalos de trabalho baseados no seu nível de TDAH e tipo de atividade",
        url: "/premium-tools/pomodoro"
      },
      {
        type: "subtitle",
        text: "Gerenciamento de Tempo Adaptativo"
      },
      {
        type: "paragraph",
        text: "Pessoas com TDAH frequentemente têm uma percepção de tempo diferente. Técnicas adaptativas podem ajudar:"
      },
      {
        type: "list",
        items: [
          "Utilize alarmes visuais e sonoros para marcar a passagem do tempo",
          "Programe lembretes para transições entre tarefas",
          "Reserve 'blocos de foco' de 25-45 minutos para trabalho intensivo",
          "Planeje 'zonas de buffer' entre compromissos para compensar transições"
        ]
      },
      {
        type: "video",
        text: "Webinar: Gerenciamento de Tempo para TDAH",
        url: "/premium-videos/time-management"
      }
    ]
  },
  {
    id: 2,
    title: "Mindfulness e Técnicas de Atenção Plena",
    description: "Práticas de meditação adaptadas para cérebros com TDAH",
    category: "education",
    icon: BookIcon,
    isPremium: true,
    content: [
      {
        type: "paragraph",
        text: "A prática de mindfulness pode ser particularmente benéfica para pessoas com TDAH, mas requer adaptações específicas para ser eficaz."
      },
      {
        type: "subtitle",
        text: "Mindfulness Adaptado para TDAH"
      },
      {
        type: "paragraph",
        text: "Técnicas tradicionais de mindfulness frequentemente pressupõem uma capacidade de foco que pode ser desafiadora para pessoas com TDAH. Estas versões adaptadas foram desenvolvidas especificamente para trabalhar com - não contra - o cérebro TDAH."
      },
      {
        type: "list",
        items: [
          "Meditações curtas de 3-5 minutos com foco em estímulos sensoriais",
          "Práticas de mindfulness em movimento como caminhada consciente",
          "Exercícios de respiração com componentes visuais ou táteis",
          "Meditação guiada com instruções frequentes para reconexão"
        ]
      },
      {
        type: "video",
        text: "Mindfulness em 5 Minutos para TDAH",
        url: "/premium-videos/mindfulness"
      }
    ]
  },
  {
    id: 3,
    title: "Agende sua Consulta com Especialista",
    description: "Converse com nossos especialistas sobre seus resultados e receba orientação personalizada",
    category: "consultation",
    icon: CalendarIcon,
    isPremium: true,
    content: [
      {
        type: "paragraph",
        text: "Como assinante premium, você tem acesso a consultas virtuais com especialistas em TDAH qualificados. Discuta seus resultados, tire dúvidas sobre estratégias de gestão e receba orientação personalizada."
      },
      {
        type: "consultation",
        text: "Agendar Consulta Virtual",
        description: "Escolha um horário conveniente para sua consulta online de 30 minutos",
        url: "/premium/schedule-consultation"
      },
      {
        type: "paragraph",
        text: "Nossas consultas são realizadas por psicólogos e psicopedagogos especializados em TDAH. Este não é um serviço de diagnóstico clínico, mas um recurso educacional e de suporte."
      }
    ]
  }
];

export default function PremiumContentPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [, navigate] = useLocation();
  const [matches, params] = useRoute('/premium-content/:id');
  const { isPremium, isLoadingUserFeatures, userPremiumFeatures } = useSubscription();
  
  // Se está carregando, mostra um indicador
  if (isLoadingUserFeatures) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-neutral-500">Carregando conteúdo premium...</p>
      </div>
    );
  }
  
  // Se não é premium, mostra tela de acesso negado
  if (!isPremium) {
    return (
      <div className="container mx-auto p-4 mb-20">
        <Header />
        <div className="my-10 flex flex-col items-center text-center">
          <div className="bg-primary/5 p-8 rounded-lg border border-primary/20 max-w-2xl">
            <LockIcon className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Conteúdo Premium Bloqueado</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Este conteúdo exclusivo está disponível apenas para assinantes premium. Faça o upgrade para desbloquear todos os recursos avançados.
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              size="lg"
              onClick={() => navigate("/subscribe")}
            >
              Assinar Premium <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  // Se tem um ID na rota, mostra o conteúdo específico
  if (matches && params?.id) {
    const articleId = parseInt(params.id);
    const article = premiumContent.find(a => a.id === articleId);
    
    if (!article) {
      return (
        <div className="container mx-auto p-4 mb-20">
          <Header />
          <div className="my-10">
            <Alert variant="destructive">
              <AlertTitle>Conteúdo não encontrado</AlertTitle>
              <AlertDescription>
                O conteúdo que você está procurando não está disponível ou foi removido.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate("/premium-content")}
            >
              Voltar para Conteúdo Premium
            </Button>
          </div>
          <BottomNav />
        </div>
      );
    }
    
    return (
      <div className="container mx-auto p-4 mb-20">
        <Header />
        <div className="mt-6 mb-10">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate("/premium-content")}
          >
            ← Voltar para lista
          </Button>
          
          <div className="flex items-center space-x-2 mb-2">
            <article.icon className="h-6 w-6 text-primary" />
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Premium
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">{article.description}</p>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {article.content.map((block, index) => {
              if (block.type === 'paragraph') {
                return <p key={index}>{block.text}</p>;
              } else if (block.type === 'subtitle') {
                return <h3 key={index} className="font-semibold mt-6 mb-3">{block.text}</h3>;
              } else if (block.type === 'list') {
                return (
                  <ul key={index} className="my-4">
                    {block.items?.map((item, i) => (
                      <li key={i} className="mb-2">{item}</li>
                    ))}
                  </ul>
                );
              } else if (block.type === 'video') {
                return (
                  <div key={index} className="my-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center mb-2">
                      <VideoIcon className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-medium">{block.text}</h4>
                    </div>
                    <div className="aspect-video bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center">
                      <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate(block.url || "#")}>
                        Assistir Vídeo
                      </Button>
                    </div>
                  </div>
                );
              } else if (block.type === 'tool') {
                return (
                  <div key={index} className="my-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center mb-2">
                      <PencilRulerIcon className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-medium">{block.text}</h4>
                    </div>
                    <p className="mb-3 text-sm">{block.description}</p>
                    <Button variant="outline" onClick={() => navigate(block.url || "#")}>
                      Acessar Ferramenta
                    </Button>
                  </div>
                );
              } else if (block.type === 'consultation') {
                return (
                  <div key={index} className="my-6 p-6 border border-primary/20 bg-primary/5 rounded-lg">
                    <div className="flex items-center mb-3">
                      <CalendarIcon className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-medium">{block.text}</h4>
                    </div>
                    <p className="mb-4">{block.description}</p>
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate(block.url || "#")}>
                      Agendar Agora
                    </Button>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }
  
  // Lista de conteúdo premium
  return (
    <div className="container mx-auto p-4 mb-20">
      <Header />
      
      <div className="my-8 text-center">
        <div className="inline-flex items-center bg-primary/10 p-2 px-3 rounded-full mb-4">
          <StarIcon className="h-4 w-4 text-primary mr-1" />
          <span className="text-sm text-primary font-medium">Conteúdo Exclusivo</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Recursos Premium</h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Acesse conteúdo exclusivo, ferramentas avançadas e consultoria especializada para gerenciar melhor o TDAH.
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="education">Educação</TabsTrigger>
          <TabsTrigger value="productivity">Produtividade</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumContent.map((content) => (
              <motion.div 
                key={content.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/premium-content/${content.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <content.icon className="h-8 w-8 text-primary p-1 bg-primary/10 rounded-lg" />
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        Premium
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{content.title}</CardTitle>
                    <CardDescription>{content.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Acessar recurso <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="education" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumContent
              .filter(content => content.category === 'education')
              .map((content) => (
                <motion.div 
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/premium-content/${content.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <content.icon className="h-8 w-8 text-primary p-1 bg-primary/10 rounded-lg" />
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          Premium
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{content.title}</CardTitle>
                      <CardDescription>{content.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="link" className="p-0 h-auto text-primary">
                        Acessar recurso <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="productivity" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumContent
              .filter(content => content.category === 'productivity')
              .map((content) => (
                <motion.div 
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/premium-content/${content.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <content.icon className="h-8 w-8 text-primary p-1 bg-primary/10 rounded-lg" />
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          Premium
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{content.title}</CardTitle>
                      <CardDescription>{content.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="link" className="p-0 h-auto text-primary">
                        Acessar recurso <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
      <BottomNav />
    </div>
  );
}

// Componente Badge faltante no arquivo
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}