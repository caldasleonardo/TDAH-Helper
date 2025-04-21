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

// Definição de temas calmantes
export type CalmingTheme = {
  id: string;
  name: string;
  gradientFrom: string;
  gradientTo: string;
  description: string;
  particlesColor: string[];
};

export const calmingThemes: CalmingTheme[] = [
  {
    id: "default",
    name: "Padrão",
    gradientFrom: "bg-neutral-50",
    gradientTo: "bg-neutral-50",
    description: "Tema neutro e minimalista, ideal para concentração",
    particlesColor: ["primary", "purple", "indigo", "blue"],
  },
  {
    id: "lavender",
    name: "Lavanda",
    gradientFrom: "from-purple-50",
    gradientTo: "to-indigo-50",
    description: "Tons de lavanda para acalmar a mente",
    particlesColor: ["purple", "indigo", "violet", "blue"],
  },
  {
    id: "ocean",
    name: "Oceano",
    gradientFrom: "from-blue-50",
    gradientTo: "to-cyan-50",
    description: "Azuis oceânicos para tranquilidade",
    particlesColor: ["blue", "cyan", "teal", "sky"],
  },
  {
    id: "sunset",
    name: "Pôr do Sol",
    gradientFrom: "from-amber-50",
    gradientTo: "to-orange-50",
    description: "Tons quentes e suaves para relaxamento",
    particlesColor: ["amber", "orange", "yellow", "red"],
  },
  {
    id: "forest",
    name: "Floresta",
    gradientFrom: "from-green-50",
    gradientTo: "to-emerald-50",
    description: "Verdes que trazem sensação de natureza",
    particlesColor: ["green", "emerald", "lime", "teal"],
  },
  {
    id: "pastel",
    name: "Tons Pastel",
    gradientFrom: "from-pink-50",
    gradientTo: "to-purple-50",
    description: "Mistura suave de tons pastel para relaxar",
    particlesColor: ["pink", "purple", "blue", "indigo"],
  },
];

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
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-${theme.particlesColor[i % theme.particlesColor.length]}-400/30`}
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
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