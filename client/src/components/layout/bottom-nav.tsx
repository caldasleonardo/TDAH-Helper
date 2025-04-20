import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { HomeIcon, BrainIcon, BookOpenIcon, UserIcon, StarIcon } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();
  
  const navItems = [
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
      active: location === "/content"
    },
    {
      href: "/premium",
      label: "Premium",
      icon: StarIcon,
      active: location.includes("/premium")
    },
    {
      href: "/profile",
      label: "Perfil",
      icon: UserIcon,
      active: location === "/profile"
    }
  ];
  
  return (
    <nav className="bg-white dark:bg-neutral-900 shadow-md border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className="flex flex-col items-center">
                <item.icon 
                  className={cn(
                    "h-6 w-6",
                    item.active 
                      ? "text-primary" 
                      : "text-neutral-500 dark:text-neutral-400"
                  )}
                />
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
              </a>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
