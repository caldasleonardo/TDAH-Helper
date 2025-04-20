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
  ArrowRightIcon
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-black overflow-hidden">
      <Header />
      
      {/* Background com partículas animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <Particle key={particle.id} {...particle} />
        ))}
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 pb-24 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <div className="h-28 w-28 flex items-center justify-center bg-gradient-to-br from-primary/30 to-purple-600/30 rounded-full backdrop-blur-md border border-white/30 dark:border-neutral-700/30">
              <BrainIcon className="h-14 w-14 text-primary drop-shadow-md" />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400"
          >
            TDAH Helper
          </motion.h1>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-neutral-700 dark:text-neutral-300 text-lg mb-8">
              Descubra insights sobre sua mente e desenvolva estratégias personalizadas para desbloquear seu potencial.
            </p>
            
            {/* Citação animada */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: showQuote ? 1 : 0, 
                height: showQuote ? "auto" : 0
              }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <blockquote className="italic text-neutral-600 dark:text-neutral-400 border-l-4 border-primary/40 pl-4 py-1">
                "Compreender o TDAH é o primeiro passo para transformar desafios em forças."
              </blockquote>
            </motion.div>
          </motion.div>
          
          {/* CTA Principal */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-12"
          >
            <Link href={user ? "/quiz" : "/auth"}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20 group transition-all duration-300 px-8"
              >
                <span>{user ? "Começar Quiz" : "Iniciar Jornada"}</span>
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                >
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </motion.div>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Cards de recursos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-center mb-8 dark:text-white">
            <SparklesIcon className="inline-block h-5 w-5 mr-2 text-primary" />
            Descubra Nossos Recursos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard 
              icon={PlayCircleIcon} 
              title="Quiz Interativo" 
              description="Avaliação personalizada baseada em critérios clínicos para entender seus padrões cognitivos"
            />
            <FeatureCard 
              icon={BarChart3Icon} 
              title="Análise Detalhada" 
              description="Resultados visualmente ricos com insights sobre áreas de atenção, hiperatividade e impulsividade"
            />
            <FeatureCard 
              icon={LightbulbIcon} 
              title="Recomendações" 
              description="Estratégias práticas personalizadas para lidar com seus desafios específicos"
            />
            <FeatureCard 
              icon={UserIcon} 
              title="Acompanhamento" 
              description="Registre seu progresso e observe sua evolução ao longo do tempo"
            />
          </div>
        </motion.div>
        
        {/* Social Proof / Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <div className="bg-gradient-to-r from-primary/5 to-purple-600/5 dark:from-primary/10 dark:to-purple-600/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10 dark:border-neutral-800">
            <h2 className="text-xl font-bold text-center mb-6 dark:text-white">O que nossos usuários dizem</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                  className="bg-white/50 dark:bg-neutral-800/50 p-4 rounded-lg shadow-sm"
                >
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-2 italic">"{review.text}"</p>
                  <p className="text-right text-sm font-medium text-primary">— {review.author}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
      
      <BottomNav />
    </div>
  );
}
