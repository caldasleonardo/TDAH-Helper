import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  CheckIcon, 
  LockOpen, 
  LightbulbIcon, 
  BrainIcon, 
  SparklesIcon, 
  PlayCircleIcon, 
  BarChart3Icon, 
  UserIcon,
  ArrowRightIcon,
  BookIcon,
  FileTextIcon
} from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

// Definições de tipos
interface ParticleProps {
  size: number;
  color: string;
  top: number;
  left: number;
  duration: number;
  delay: number;
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ReviewItem {
  text: string;
  author: string;
}

// Componente de partícula animada para o fundo
const Particle = ({ size, color, top, left, duration, delay }: ParticleProps) => {
  // Mapeando cores para classes específicas do Tailwind
  const colorClasses: Record<string, string> = {
    primary: "bg-primary/30",
    purple: "bg-purple-600/30", 
    indigo: "bg-indigo-500/30",
    blue: "bg-blue-500/30"
  };
  
  return (
    <motion.div
      className={`absolute rounded-full ${colorClasses[color]}`}
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: size,
        height: size,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0, 1.2, 0],
        y: [0, -20, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1,
      }}
    />
  );
};

// Componente de card de recurso com animação ao passar o mouse
const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  const controls = useAnimation();
  
  return (
    <motion.div
      className="rounded-xl bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm p-5 border border-white/20 dark:border-neutral-700/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
      whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(124, 58, 237, 0.1)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => controls.start({ scale: 1.1, color: "var(--primary)" })}
      onHoverEnd={() => controls.start({ scale: 1, color: "currentColor" })}
    >
      <motion.div 
        animate={controls}
        className="mb-3 text-primary"
      >
        <Icon className="h-7 w-7" />
      </motion.div>
      <h3 className="text-lg font-semibold mb-2 dark:text-white">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm">{description}</p>
    </motion.div>
  );
};

export default function HomePage() {
  const { user } = useAuth();
  const [showQuote, setShowQuote] = useState(false);
  
  // Gerar partículas aleatórias para o fundo
  const particles: (ParticleProps & {id: number})[] = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    size: Math.random() * 15 + 5,
    color: ["primary", "purple", "indigo", "blue"][Math.floor(Math.random() * 4)],
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: Math.random() * 5 + 3,
    delay: Math.random() * 2,
  }));
  
  // Mostrar a citação após um atraso
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuote(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 to-purple-600/5 dark:from-neutral-900 dark:to-black overflow-hidden">
      <Header />
      
      {/* Background com partículas animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <Particle key={particle.id} {...particle} />
        ))}
      </div>
      
      <main className="flex-grow relative z-10 pb-20 pt-3 max-w-lg mx-auto">
        {/* Card principal em estilo app */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-lg rounded-3xl mx-4 overflow-hidden shadow-xl"
        >
          {/* Área superior com gradiente */}
          <div className="bg-gradient-to-br from-primary to-purple-600 pt-8 pb-16 px-6 relative overflow-hidden">
            {/* Círculos decorativos */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10"></div>
            <div className="absolute top-10 -left-10 w-24 h-24 rounded-full bg-white/5"></div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 1 }}
              className="relative z-10"
            >
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white mb-1">TDAH Helper</h1>
                <div className="h-10 w-10 flex items-center justify-center bg-white/20 rounded-full">
                  <BrainIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              
              <p className="text-white/80 text-sm mb-3 max-w-[280px]">
                Descubra insights e estratégias personalizadas para o seu TDAH
              </p>
            </motion.div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="px-6 py-5 -mt-12">
            {/* Card em destaque */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-700 rounded-2xl p-5 shadow-lg mb-6"
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-full mr-4">
                  <LightbulbIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg dark:text-white">Comece sua avaliação</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 text-sm">20 perguntas • 5 minutos</p>
                </div>
              </div>
              
              <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-4">
                Complete o quiz para receber resultados personalizados e recomendações práticas para seu dia a dia.
              </p>
              
              <Link href={user ? "/quiz" : "/auth"} className="block">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-5 font-medium"
                >
                  <span>{user ? "Iniciar Quiz" : "Entrar para começar"}</span>
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
            
            {/* Ferramentas de acesso rápido */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-semibold mb-3 text-neutral-800 dark:text-white">Acesso Rápido</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Link href="/mood-tracking">
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 p-4 rounded-2xl shadow-sm transition-transform hover:scale-105">
                    <div className="h-10 w-10 flex items-center justify-center bg-blue-500/20 rounded-xl mb-2">
                      <SparklesIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <h4 className="font-medium text-sm text-neutral-800 dark:text-white">Rastreador de Humor</h4>
                  </div>
                </Link>
                <Link href="/content">
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 p-4 rounded-2xl shadow-sm transition-transform hover:scale-105">
                    <div className="h-10 w-10 flex items-center justify-center bg-purple-500/20 rounded-xl mb-2">
                      <BookIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <h4 className="font-medium text-sm text-neutral-800 dark:text-white">Conteúdo Educativo</h4>
                  </div>
                </Link>
              </div>
            </motion.div>
            
            {/* Depoimentos em carrossel */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-neutral-800 dark:text-white">Experiências</h3>
                <span className="text-xs text-primary">Ver mais</span>
              </div>
              
              <div className="overflow-x-auto pb-4 -mx-6 px-6 flex space-x-4 scrollbar-hide-until-hover">
                {[
                  {
                    text: "Finalmente entendi por que sempre tive dificuldades para me concentrar. As estratégias sugeridas realmente funcionam!",
                    author: "Ana C."
                  },
                  {
                    text: "Interface intuitiva e resultados bem explicados. Ajudou-me a buscar ajuda profissional no momento certo.",
                    author: "Marcos L."
                  },
                  {
                    text: "O rastreador de humor é incrível! Ajudou-me a perceber padrões em meus estados emocionais e como eles afetam meu TDAH.",
                    author: "Carla S."
                  }
                ].map((review: ReviewItem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="bg-neutral-50 dark:bg-neutral-700 p-4 rounded-xl shadow-sm min-w-[280px] flex-shrink-0"
                  >
                    <div className="flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-2 text-xs font-bold text-primary">
                        {review.author.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-neutral-800 dark:text-white">{review.author}</span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-300 text-sm italic">"{review.text}"</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Cards de recursos em formato app */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="px-4 mt-5"
        >
          <h3 className="font-semibold mb-3 text-neutral-800 dark:text-white pl-1">Recursos Premium</h3>
          
          <div className="overflow-x-auto pb-4 -mx-4 px-4 flex space-x-4 scrollbar-hide-until-hover">
            <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 dark:from-orange-500/20 dark:to-pink-500/20 p-4 rounded-2xl shadow-sm min-w-[200px] flex-shrink-0">
              <div className="h-10 w-10 flex items-center justify-center bg-orange-500/20 rounded-xl mb-2">
                <BarChart3Icon className="h-5 w-5 text-orange-500" />
              </div>
              <h4 className="font-medium text-sm text-neutral-800 dark:text-white mb-1">Análise Detalhada</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Gráficos e métricas avançadas sobre seus padrões</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 dark:from-green-500/20 dark:to-teal-500/20 p-4 rounded-2xl shadow-sm min-w-[200px] flex-shrink-0">
              <div className="h-10 w-10 flex items-center justify-center bg-green-500/20 rounded-xl mb-2">
                <UserIcon className="h-5 w-5 text-green-500" />
              </div>
              <h4 className="font-medium text-sm text-neutral-800 dark:text-white mb-1">Consultoria</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Acesso a especialistas para acompanhamento</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 p-4 rounded-2xl shadow-sm min-w-[200px] flex-shrink-0">
              <div className="h-10 w-10 flex items-center justify-center bg-blue-500/20 rounded-xl mb-2">
                <PlayCircleIcon className="h-5 w-5 text-blue-500" />
              </div>
              <h4 className="font-medium text-sm text-neutral-800 dark:text-white mb-1">Exercícios</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Técnicas interativas para foco e atenção</p>
            </div>
          </div>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
