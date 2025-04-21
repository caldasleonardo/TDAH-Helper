import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Achievement } from "@shared/schema";
import { LucideIcon, Star, Medal, Award, Trophy, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AchievementBadgeProps {
  achievement: Achievement;
  progress: number;
  completed: boolean;
  completedAt?: Date;
  onClick?: () => void;
  className?: string;
  showProgress?: boolean;
}

// Mapeamento de ícones por nome
const iconMap: Record<string, LucideIcon> = {
  "star": Star,
  "medal": Medal, 
  "award": Award,
  "trophy": Trophy,
  "check": CheckCircle2,
};

export function AchievementBadge({
  achievement,
  progress,
  completed,
  completedAt,
  onClick,
  className,
  showProgress = true,
}: AchievementBadgeProps) {
  // Calcular porcentagem de progresso
  const progressPercentage = Math.min(
    100,
    Math.floor((progress / achievement.requiredCount) * 100)
  );
  
  // Determinar se a conquista está bloqueada (progress === 0)
  const isLocked = progress === 0;
  
  // Determinar o ícone a ser usado
  const IconComponent = iconMap[achievement.icon] || Trophy;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card 
            className={cn(
              "transition-all duration-300 h-full",
              isLocked ? "opacity-70 grayscale" : "",
              completed ? "border-2 border-green-500 shadow-md" : "",
              "hover:shadow-lg cursor-pointer",
              className
            )}
            onClick={onClick}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div 
                  className={cn(
                    "p-2 rounded-full w-10 h-10 flex items-center justify-center",
                    `bg-${achievement.iconColor || "primary"}-100 text-${achievement.iconColor || "primary"}-500`
                  )}
                >
                  <IconComponent
                    className={cn(
                      "w-6 h-6",
                      completed ? "text-green-500" : `text-${achievement.iconColor || "primary"}-500`
                    )}
                  />
                </div>
                {completed && (
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    Concluída
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-2 text-base">
                {achievement.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CardDescription className="text-sm min-h-[40px]">
                {achievement.description}
              </CardDescription>
              
              {showProgress && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progresso</span>
                    <span>
                      {progress} / {achievement.requiredCount}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              )}
            </CardContent>
            {completedAt && (
              <CardFooter className="p-4 pt-2">
                <p className="text-xs text-muted-foreground">
                  Concluída em {format(new Date(completedAt), "PPP", { locale: ptBR })}
                </p>
              </CardFooter>
            )}
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-bold">{achievement.title}</p>
            <p>{achievement.description}</p>
            {!isLocked && (
              <p className="text-sm mt-1">
                {progress} de {achievement.requiredCount} {completed ? "(Completa)" : ""}
              </p>
            )}
            {completed && achievement.xpPoints > 0 && (
              <p className="text-xs mt-1 text-green-600">
                +{achievement.xpPoints} XP
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}