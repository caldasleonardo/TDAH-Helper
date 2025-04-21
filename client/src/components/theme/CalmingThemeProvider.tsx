import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { CalmingTheme, calmingThemes } from "./ThemeSelector";

type CalmingThemeContextType = {
  theme: CalmingTheme;
  setTheme: (theme: CalmingTheme) => void;
};

const CalmingThemeContext = createContext<CalmingThemeContextType | undefined>(undefined);

export function CalmingThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<CalmingTheme>(() => {
    // Inicializa com o tema padrão
    return calmingThemes[0];
  });

  // Carrega o tema do localStorage quando o componente monta
  useEffect(() => {
    const savedTheme = localStorage.getItem("calming-theme");
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setTheme(parsedTheme);
      } catch (error) {
        console.error("Erro ao carregar tema:", error);
      }
    }
  }, []);

  // Salva o tema no localStorage quando ele muda
  useEffect(() => {
    localStorage.setItem("calming-theme", JSON.stringify(theme));
  }, [theme]);

  return (
    <CalmingThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </CalmingThemeContext.Provider>
  );
}

export function useCalmingTheme() {
  const context = useContext(CalmingThemeContext);
  if (context === undefined) {
    throw new Error("useCalmingTheme deve ser usado dentro de um CalmingThemeProvider");
  }
  return context;
}