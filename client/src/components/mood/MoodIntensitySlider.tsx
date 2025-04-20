import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { MoodType } from "@/hooks/use-mood-tracking";

// Mapear tipos de humor para cores
const moodColors: Record<MoodType, { bg: string, track: string }> = {
  happy: { bg: "bg-yellow-100", track: "bg-yellow-400" },
  calm: { bg: "bg-blue-100", track: "bg-blue-300" },
  sad: { bg: "bg-blue-200", track: "bg-blue-500" },
  angry: { bg: "bg-red-100", track: "bg-red-500" },
  anxious: { bg: "bg-orange-100", track: "bg-orange-400" },
  tired: { bg: "bg-gray-100", track: "bg-gray-400" },
  energetic: { bg: "bg-yellow-100", track: "bg-yellow-500" },
  focused: { bg: "bg-purple-100", track: "bg-purple-400" },
};

interface MoodIntensitySliderProps {
  mood: MoodType;
  intensity: number;
  onChange: (value: number) => void;
  className?: string;
}

export function MoodIntensitySlider({ 
  mood, 
  intensity, 
  onChange,
  className 
}: MoodIntensitySliderProps) {
  const { bg, track } = moodColors[mood];
  
  // Rótulos para os níveis de intensidade
  const intensityLabels = [
    "Muito baixo",
    "Baixo",
    "Médio",
    "Alto",
    "Muito alto"
  ];

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Intensidade:</span>
        <span className="text-sm font-medium">{intensityLabels[intensity - 1]}</span>
      </div>
      
      <Slider
        className={cn("py-2", bg, track)}
        min={1}
        max={5}
        step={1}
        value={[intensity]}
        onValueChange={(values) => onChange(values[0])}
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Fraco</span>
        <span>Forte</span>
      </div>
    </div>
  );
}