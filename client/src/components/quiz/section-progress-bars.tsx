import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BrainIcon, ActivityIcon, ZapIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SectionProgressProps {
  sections: {
    inattention: {
      total: number;
      answered: number;
      percentage: number;
    };
    hyperactivity: {
      total: number;
      answered: number;
      percentage: number;
    };
    impulsivity: {
      total: number;
      answered: number;
      percentage: number;
    };
  };
  currentType: string;
  className?: string;
}

export function SectionProgressBars({ sections, currentType, className }: SectionProgressProps) {
  const sectionInfo = {
    inattention: {
      icon: BrainIcon,
      label: "Desatenção",
      color: "bg-blue-500",
      activeColor: "bg-blue-600",
      lightColor: "bg-blue-100",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    hyperactivity: {
      icon: ActivityIcon,
      label: "Hiperatividade",
      color: "bg-green-500",
      activeColor: "bg-green-600",
      lightColor: "bg-green-100",
      textColor: "text-green-700 dark:text-green-400",
    },
    impulsivity: {
      icon: ZapIcon,
      label: "Impulsividade",
      color: "bg-orange-500",
      activeColor: "bg-orange-600",
      lightColor: "bg-orange-100",
      textColor: "text-orange-700 dark:text-orange-400",
    },
  };

  return (
    <div className={cn("", className)}>
      <TooltipProvider>
        <div className="flex gap-1.5 mb-2">
          {Object.entries(sections).map(([type, data]) => {
            const info = sectionInfo[type as keyof typeof sectionInfo];
            const Icon = info.icon;
            const isActive = currentType === type;
            
            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Icon 
                        className={cn(
                          "h-3 w-3", 
                          isActive ? info.textColor : "text-neutral-500"
                        )} 
                      />
                      <span className={cn(
                        "text-xs font-medium",
                        isActive ? info.textColor : "text-neutral-500"
                      )}>
                        {data.answered}/{data.total}
                      </span>
                    </div>
                    
                    <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full", 
                          isActive ? info.activeColor : info.color
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${data.percentage}%` }}
                        transition={{ 
                          duration: 0.5, 
                          ease: "easeOut",
                          delay: isActive ? 0 : 0.1 
                        }}
                      />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="py-1 px-2 text-xs">
                  <p>{info.label}: {Math.round(data.percentage)}% completo</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}