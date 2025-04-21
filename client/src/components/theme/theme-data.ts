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