import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserLevel } from "@/hooks/use-user-level";
import { cn } from "@/lib/utils";
import { Award, Flame, Sparkles } from "lucide-react";

interface UserLevelCardProps {
  className?: string;
}

export function UserLevelCard({ className }: UserLevelCardProps) {
  const { userLevel, isLoadingUserLevel, calculateXpPercentage } = useUserLevel();
  
  if (isLoadingUserLevel) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="animate-pulse">
          <div className="h-6 bg-muted rounded-md mb-2"></div>
          <div className="h-4 bg-muted rounded-md w-3/4"></div>
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
          <div className="h-2 bg-muted rounded-md w-full"></div>
        </CardContent>
      </Card>
    );
  }
  
  if (!userLevel) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Nível de Usuário</CardTitle>
          <CardDescription>
            Faça login para visualizar seu progresso.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const xpPercentage = calculateXpPercentage();
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-primary" />
            Nível {userLevel.level}
          </CardTitle>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {userLevel.loginStreak}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sequência de {userLevel.loginStreak} dias de login</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Continue usando o app para ganhar experiência e subir de nível!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm mb-1">
          <div className="flex items-center">
            <Sparkles className="mr-1 h-4 w-4 text-yellow-500" />
            <span>{userLevel.xpPoints} XP</span>
          </div>
          <span>
            {userLevel.xpPoints} / {userLevel.xpToNextLevel} para o próximo nível
          </span>
        </div>
        <Progress 
          value={xpPercentage} 
          className="h-2"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Ganhe XP completando conquistas, respondendo questionários e usando recursos do aplicativo regularmente.
        </p>
      </CardContent>
    </Card>
  );
}