import { useState } from "react";
import { cn } from "@/lib/utils";
import { MoodType } from "@/hooks/use-mood-tracking";
import { motion } from "framer-motion";

// Mapear tipos de humor para emojis e cores
const moodEmojis: Record<MoodType, { emoji: string; color: string; label: string }> = {
  happy: { emoji: "😄", color: "bg-yellow-400", label: "Feliz" },
  calm: { emoji: "😌", color: "bg-blue-300", label: "Calmo" },
  sad: { emoji: "😢", color: "bg-blue-500", label: "Triste" },
  angry: { emoji: "😠", color: "bg-red-500", label: "Irritado" },
  anxious: { emoji: "😰", color: "bg-orange-400", label: "Ansioso" },
  tired: { emoji: "😴", color: "bg-gray-400", label: "Cansado" },
  energetic: { emoji: "⚡", color: "bg-yellow-500", label: "Energético" },
  focused: { emoji: "🧠", color: "bg-purple-400", label: "Focado" },
};

interface MoodEmojiProps {
  mood: MoodType;
  intensity?: number;
  size?: "sm" | "md" | "lg" | "xl";
  isSelected?: boolean;
  onClick?: () => void;
  animated?: boolean;
  className?: string;
}

export function MoodEmoji({ 
  mood, 
  intensity = 3, 
  size = "md", 
  isSelected = false,
  onClick,
  animated = true,
  className 
}: MoodEmojiProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { emoji, color, label } = moodEmojis[mood];
  
  // Mapear tamanhos para classes CSS
  const sizeClasses = {
    sm: "text-lg w-10 h-10",
    md: "text-2xl w-14 h-14",
    lg: "text-3xl w-16 h-16",
    xl: "text-4xl w-20 h-20",
  };
  
  // Ajustar a opacidade baseada na intensidade (1-5)
  const intensityOpacity = 0.4 + (intensity * 0.15);
  
  // Variantes para a animação do emoji
  const variants = {
    hover: {
      scale: animated ? 1.2 : 1,
      y: animated ? -5 : 0,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: animated ? 0.9 : 1,
      transition: { duration: 0.1 }
    },
    initial: { scale: 1, y: 0 }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className={cn(
          "flex items-center justify-center rounded-full cursor-pointer",
          color,
          sizeClasses[size],
          isSelected ? "ring-4 ring-primary ring-offset-2" : "",
          className
        )}
        style={{ opacity: intensityOpacity }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
        whileTap="tap"
        variants={variants}
      >
        <span className="select-none">{emoji}</span>
      </motion.div>
      {size !== "sm" && <span className="text-xs text-center">{label}</span>}
    </div>
  );
}