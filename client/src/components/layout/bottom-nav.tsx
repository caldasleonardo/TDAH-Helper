import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { HomeIcon, BrainIcon, BookOpenIcon, UserIcon, StarIcon, TimerIcon, BookIcon, SparklesIcon } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { Badge } from "@/components/ui/badge";

export function BottomNav() {
  const [location] = useLocation();
  const { isPremium } = useSubscription();
  
  // Ícone Premium com indicador
  const PremiumIcon = () => (
    <div className="relative">
      <StarIcon className={cn(
        "h-6 w-6",
        location.includes("/premium") 
          ? "text-primary" 
          : "text-neutral-500 dark:text-neutral-400"
      )} />
      {isPremium && (
        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-primary rounded-full"></div>
      )}
    </div>
  );
  
  // Itens de navegação principal
  const mainNavItems = [
    {
      href: "/",
      label: "Início",
      icon: HomeIcon,
      active: location === "/"
    },
    {
      href: "/quiz",
      label: "Testes",
      icon: BrainIcon,
      active: location.includes("/quiz") || location.includes("/results")
    },
    {
      href: "/content",
      label: "Conteúdo",
      icon: BookOpenIcon,
      active: location === "/content" || location === "/content/"
    },
    {
      href: "/premium",
      label: "Premium",
      icon: PremiumIcon,
      isComponent: true,
      active: location.includes("/premium") && !location.includes("/premium-content") && !location.includes("/premium-tools")
    },
    {
      href: "/profile",
      label: "Perfil",
      icon: UserIcon,
      active: location === "/profile"
    }
  ];
  
  // Itens de navegação premium (apenas para assinantes)
  const premiumNavItems = isPremium ? [
    {
      href: "/premium-content",
      label: "Premium",
      icon: SparklesIcon,
      active: location.includes("/premium-content")
    },
    {
      href: "/premium-tools/pomodoro",
      label: "Pomodoro",
      icon: TimerIcon,
      active: location.includes("/premium-tools/pomodoro")
    }
  ] : [];
  
  // Determinar quais itens mostrar com base na localização
  const showPremiumNav = isPremium && (
    location.includes("/premium-content") || 
    location.includes("/premium-tools")
  );
  
  // Itens a serem exibidos
  const displayItems = showPremiumNav ? premiumNavItems : mainNavItems;
  
  return (
    <nav className="bg-white dark:bg-neutral-900 shadow-md border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto">
        {/* Indicador de modo premium quando em páginas premium */}
        {showPremiumNav && (
          <div className="flex justify-center mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs py-1">
              Modo Premium
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-around">
          {displayItems.map((item) => (
            <Link key={item.href} href={item.href} 
              className="flex flex-col items-center">
                {item.isComponent ? (
                  <item.icon />
                ) : (
                  <item.icon 
                    className={cn(
                      "h-6 w-6",
                      item.active 
                        ? "text-primary" 
                        : "text-neutral-500 dark:text-neutral-400"
                    )}
                  />
                )}
                <span 
                  className={cn(
                    "text-xs mt-1",
                    item.active 
                      ? "text-primary" 
                      : "text-neutral-500 dark:text-neutral-400"
                  )}
                >
                  {item.label}
                </span>
            </Link>
          ))}
          
          {/* Botão de voltar quando em modo premium */}
          {showPremiumNav && (
            <Link href="/premium" className="flex flex-col items-center">
              <HomeIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-400" />
              <span className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">
                Principal
              </span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
