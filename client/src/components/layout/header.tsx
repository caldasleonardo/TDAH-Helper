import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { MoonIcon, SunIcon, BrainIcon, UserIcon } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logoutMutation } = useAuth();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-primary text-xl">
            <BrainIcon size={24} />
          </span>
          <Link href="/">
            <h1 className="text-xl font-bold text-neutral-800 dark:text-white cursor-pointer">TDAH Helper</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Alternar modo escuro"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5 text-yellow-300" />
            ) : (
              <MoonIcon className="h-5 w-5 text-neutral-600" />
            )}
          </Button>
          
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-300 hidden md:inline">
                {user.username}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hidden md:inline-flex"
              >
                Sair
              </Button>
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="md:hidden">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
