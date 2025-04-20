import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { BrainIcon, BookIcon, ClockIcon, ActivityIcon } from "lucide-react";

export default function ContentPage() {
  const articles = [
    {
      id: 1,
      title: "O que é TDAH?",
      description: "Entenda os diferentes aspectos do Transtorno do Déficit de Atenção e Hiperatividade",
      category: "basics",
      readTime: 5,
      icon: BrainIcon
    },
    {
      id: 2,
      title: "Mitos e verdades sobre TDAH",
      description: "Desfazendo concepções errôneas comuns sobre o transtorno",
      category: "basics",
      readTime: 7,
      icon: BookIcon
    },
    {
      id: 3,
      title: "Técnicas de gerenciamento de tempo",
      description: "Estratégias práticas para melhorar sua produtividade",
      category: "strategies",
      readTime: 8,
      icon: ClockIcon
    },
    {
      id: 4,
      title: "Método Pomodoro adaptado para TDAH",
      description: "Como utilizar efetivamente a técnica de gerenciamento de tempo",
      category: "strategies",
      readTime: 6,
      icon: ClockIcon
    },
    {
      id: 5,
      title: "TDAH e relacionamentos",
      description: "Como o transtorno pode afetar suas interações sociais",
      category: "lifestyle",
      readTime: 9,
      icon: ActivityIcon
    },
    {
      id: 6,
      title: "Alimentação e TDAH",
      description: "O impacto da dieta nos sintomas do transtorno",
      category: "lifestyle",
      readTime: 7,
      icon: ActivityIcon
    }
  ];

  const ArticleCard = ({ article }: { article: typeof articles[0] }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <article.icon className="h-8 w-8 text-primary p-1 bg-primary/10 rounded-lg" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center">
            <ClockIcon className="h-3 w-3 mr-1" /> {article.readTime} min
          </span>
        </div>
        <CardTitle className="text-lg">{article.title}</CardTitle>
        <CardDescription>{article.description}</CardDescription>
      </CardHeader>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold dark:text-white mb-2">Conteúdo Educativo</h1>
              <p className="text-neutral-600 dark:text-neutral-300">
                Aprenda mais sobre TDAH, estratégias de foco e produtividade
              </p>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="basics">Conceitos Básicos</TabsTrigger>
                <TabsTrigger value="strategies">Estratégias</TabsTrigger>
                <TabsTrigger value="lifestyle">Estilo de Vida</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map(article => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArticleCard article={article} />
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="basics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles
                    .filter(article => article.category === "basics")
                    .map(article => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArticleCard article={article} />
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="strategies">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles
                    .filter(article => article.category === "strategies")
                    .map(article => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArticleCard article={article} />
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="lifestyle">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles
                    .filter(article => article.category === "lifestyle")
                    .map(article => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ArticleCard article={article} />
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
