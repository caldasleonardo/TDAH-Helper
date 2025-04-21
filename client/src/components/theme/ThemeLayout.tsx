import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useCalmingTheme } from "./CalmingThemeProvider";

type ThemeLayoutProps = {
  children: ReactNode;
};

export function ThemeLayout({ children }: ThemeLayoutProps) {
  const { theme } = useCalmingTheme();

  return (
    <div 
      className={cn(
        "min-h-screen transition-colors duration-300",
        "bg-gradient-to-br",
        theme.gradientFrom,
        theme.gradientTo
      )}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-${theme.particlesColor[i % theme.particlesColor.length]}-400/20`}
            style={{
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
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