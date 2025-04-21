import React, { ReactNode, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCalmingTheme } from "./CalmingThemeProvider";

type ThemeLayoutProps = {
  children: ReactNode;
};

export function ThemeLayout({ children }: ThemeLayoutProps) {
  const { theme } = useCalmingTheme();

  // Memorizar as cores e propriedades aleatórias das partículas para evitar re-renderização
  const particles = useMemo(() => {
    return [...Array(30)].map((_, i) => {
      const colorKey = theme.particlesColor[i % theme.particlesColor.length];
      let bgColorClass = '';
      
      // Mapear cores para classes Tailwind
      switch (colorKey) {
        case 'primary':
          bgColorClass = 'bg-primary';
          break;
        case 'purple':
          bgColorClass = 'bg-purple-400';
          break;
        case 'indigo':
          bgColorClass = 'bg-indigo-400';
          break;
        case 'blue':
          bgColorClass = 'bg-blue-400';
          break;
        case 'cyan':
          bgColorClass = 'bg-cyan-400';
          break;
        case 'teal':
          bgColorClass = 'bg-teal-400';
          break;
        case 'sky':
          bgColorClass = 'bg-sky-400';
          break;
        case 'amber':
          bgColorClass = 'bg-amber-400';
          break;
        case 'orange':
          bgColorClass = 'bg-orange-400';
          break;
        case 'yellow':
          bgColorClass = 'bg-yellow-400';
          break;
        case 'red':
          bgColorClass = 'bg-red-400';
          break;
        case 'green':
          bgColorClass = 'bg-green-400';
          break;
        case 'emerald':
          bgColorClass = 'bg-emerald-400';
          break;
        case 'lime':
          bgColorClass = 'bg-lime-400';
          break;
        case 'pink':
          bgColorClass = 'bg-pink-400';
          break;
        case 'violet':
          bgColorClass = 'bg-violet-400';
          break;
        default:
          bgColorClass = 'bg-primary';
      }
      
      return {
        id: i,
        bgColorClass,
        width: Math.random() * 30 + 10,
        height: Math.random() * 30 + 10,
        top: Math.random() * 100,
        left: Math.random() * 100,
        animationDuration: Math.random() * 20 + 10,
        animationDelay: Math.random() * 5
      };
    });
  }, [theme.particlesColor]);

  return (
    <div 
      className={cn(
        "min-h-screen transition-colors duration-300",
        "bg-gradient-to-br",
        theme.gradientFrom,
        theme.gradientTo
      )}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${particle.bgColorClass}/20`}
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              animationDuration: `${particle.animationDuration}s`,
              animationDelay: `${particle.animationDelay}s`,
              animationIterationCount: "infinite",
              animationName: "float",
              animationTimingFunction: "ease-in-out",
            }}
          />
        ))}
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}