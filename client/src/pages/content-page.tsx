import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { ChevronRightIcon, ClockIcon } from "lucide-react";
import { articles, type Article } from "@/lib/content-data";

export default function ContentPage() {
  const [matches, params] = useRoute('/content/:id');
  const [, navigate] = useLocation();

  // Se houver um ID na rota, mostra o artigo específico
  if (matches && params?.id) {
    const articleId = parseInt(params.id);
    const article = articles.find(a => a.id === articleId);
    
    if (!article) {
      return <div>Artigo não encontrado</div>;
    }
    
    return <ArticleDetail article={article} />;
  }

  // Componente para o card de artigo na listagem
  const ArticleCard = ({ article }: { article: Article }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/content/${article.id}`)}>
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
      <CardContent className="pt-0">
        <Button variant="ghost" size="sm" className="text-primary flex items-center mt-2 p-0">
          Ler artigo <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );

  // Componente para exibir o conteúdo detalhado de um artigo
  function ArticleDetail({ article }: { article: Article }) {
    const [, navigate] = useLocation();
    
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
              <Button
                variant="ghost"
                className="mb-4 p-0"
                onClick={() => navigate("/content")}
              >
                <ChevronRightIcon className="h-4 w-4 mr-1 rotate-180" /> Voltar para artigos
              </Button>
              
              <article className="prose dark:prose-invert prose-purple max-w-none">
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <article.icon className="h-10 w-10 text-primary p-1.5 bg-primary/10 rounded-lg mr-3" />
                    <div>
                      <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10">
                        {article.category === "basics" ? "Conceitos Básicos" : 
                         article.category === "strategies" ? "Estratégias" : "Estilo de Vida"}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center ml-2 inline-flex">
                        <ClockIcon className="h-3 w-3 mr-1" /> {article.readTime} min de leitura
                      </span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold mb-3 dark:text-white">{article.title}</h1>
                  <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6">{article.description}</p>
                </div>
                
                <div className="space-y-6">
                  {article.content.map((block, index) => {
                    switch (block.type) {
                      case 'paragraph':
                        return <p key={index} className="text-neutral-800 dark:text-neutral-200">{block.text}</p>;
                      case 'subtitle':
                        return <h2 key={index} className="text-xl font-semibold mt-8 mb-3 dark:text-white">{block.text}</h2>;
                      case 'list':
                        return (
                          <ul key={index} className="list-disc pl-6 space-y-2">
                            {block.items?.map((item, i) => (
                              <li key={i} className="text-neutral-700 dark:text-neutral-300">{item}</li>
                            ))}
                          </ul>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
                
                <div className="border-t dark:border-neutral-800 mt-10 pt-6">
                  <h3 className="text-lg font-medium mb-4 dark:text-white">Artigos relacionados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles
                      .filter(a => a.category === article.category && a.id !== article.id)
                      .slice(0, 2)
                      .map(relatedArticle => (
                        <Card 
                          key={relatedArticle.id} 
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/content/${relatedArticle.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <relatedArticle.icon className="h-6 w-6 text-primary shrink-0 mr-3" />
                              <div>
                                <h4 className="font-medium text-sm mb-1 dark:text-white">{relatedArticle.title}</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {relatedArticle.readTime} min de leitura
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </article>
            </div>
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