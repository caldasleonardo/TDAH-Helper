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
    },
    hyperactivity: {
      icon: ActivityIcon,
      label: "Hiperatividade",
      color: "bg-green-500",
      activeColor: "bg-green-600",
      lightColor: "bg-green-100",
    },
    impulsivity: {
      icon: ZapIcon,
      label: "Impulsividade",
      color: "bg-orange-500",
      activeColor: "bg-orange-600",
      lightColor: "bg-orange-100",
    },
  };

  return (
    <div className={cn("space-y-3", className)}>
      <TooltipProvider>
        {Object.entries(sections).map(([type, data]) => {
          const info = sectionInfo[type as keyof typeof sectionInfo];
          const Icon = info.icon;
          const isActive = currentType === type;
          
          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 mb-1">
                <Icon 
                  className={cn(
                    "h-4 w-4 mr-2", 
                    isActive ? "text-primary" : "text-neutral-500"
                  )} 
                />
                <span>{info.label}</span>
                <span className="text-neutral-500 dark:text-neutral-400 ml-auto">
                  {data.answered}/{data.total}
                </span>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>{`${Math.round(data.percentage)}% completo`}</p>
                </TooltipContent>
              </Tooltip>
              
              <div className="grid grid-cols-12 gap-0.5 mt-1">
                {Array.from({ length: data.total }).map((_, i) => {
                  const isAnswered = i < data.answered;
                  return (
                    <motion.div
                      key={i}
                      className={cn(
                        "h-1 rounded-sm",
                        isAnswered 
                          ? isActive ? info.activeColor : info.color 
                          : info.lightColor
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: isAnswered ? 1 : 0.4,
                        scale: isAnswered ? 1 : 0.8,
                      }}
                      transition={{ 
                        duration: 0.3, 
                        delay: i * 0.03
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </TooltipProvider>
    </div>
  );
}