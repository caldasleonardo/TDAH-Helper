import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { CalmingTheme, calmingThemes } from "./theme-data";

type CalmingThemeContextType = {
  theme: CalmingTheme;
  setTheme: (theme: CalmingTheme) => void;
};

const CalmingThemeContext = createContext<CalmingThemeContextType | undefined>(undefined);

export function CalmingThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<CalmingTheme>(() => {
    // Verificar se há um tema salvo
    try {
      const savedTheme = localStorage.getItem("calming-theme");
      if (savedTheme) {
        return JSON.parse(savedTheme);
      }
    } catch (error) {
      console.error("Erro ao carregar tema:", error);
    }
    // Inicializa com o tema padrão se não houver tema salvo ou ocorrer um erro
    return calmingThemes[0];
  });

  // Salva o tema no localStorage quando ele muda
  useEffect(() => {
    try {
      localStorage.setItem("calming-theme", JSON.stringify(theme));
    } catch (error) {
      console.error("Erro ao salvar tema:", error);
    }
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