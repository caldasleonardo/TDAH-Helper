import { useState } from "react";
import { Check, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCalmingTheme } from "./CalmingThemeProvider";
import { CalmingTheme, calmingThemes } from "./theme-data";

// Hook para gerenciar o tema está agora em CalmingThemeProvider.tsx

// Visualização do tema
const ThemePreview = ({ theme }: { theme: CalmingTheme }) => {
  return (
    <div 
      className={cn(
        "h-20 w-full rounded-md flex items-center justify-center relative overflow-hidden",
        "bg-gradient-to-br",
        theme.gradientFrom,
        theme.gradientTo
      )}
    >
      <div className="absolute inset-0 opacity-20">
        {[...Array(5)].map((_, i) => {
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
          
          return (
            <div
              key={i}
              className={`absolute rounded-full ${bgColorClass}/30`}
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          );
        })}
      </div>
      <span className="font-medium text-sm text-neutral-800 z-10">{theme.name}</span>
    </div>
  );
};

// Componente principal do seletor de temas
export function ThemeSelector() {
  const { theme, setTheme } = useCalmingTheme();
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Paintbrush className="h-4 w-4" />
            <span className="sr-only">Temas calmantes</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowDialog(true)}>
            Escolher tema calmante
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escolha um tema calmante</DialogTitle>
            <DialogDescription>
              Selecione um tema de fundo que ajude a acalmar sua mente
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            {calmingThemes.map((calmTheme) => (
              <div key={calmTheme.id} className="space-y-2">
                <button
                  onClick={() => {
                    setTheme(calmTheme);
                    toast({
                      title: "Tema alterado",
                      description: `Tema alterado para ${calmTheme.name}`,
                    });
                  }}
                  className="w-full group relative"
                >
                  <div className={cn(
                    "rounded-md border-2 transition-all",
                    theme.id === calmTheme.id ? "border-primary" : "border-transparent group-hover:border-primary/50"
                  )}>
                    <ThemePreview theme={calmTheme} />
                  </div>
                  {theme.id === calmTheme.id && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
                <p className="text-xs text-center text-muted-foreground">{calmTheme.description}</p>
              </div>
            ))}
          </div>
          
          <DialogClose asChild>
            <Button variant="outline" className="w-full">Fechar</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}