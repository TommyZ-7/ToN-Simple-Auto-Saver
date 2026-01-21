import {
  Zap,
  Rocket,
  Briefcase,
  Gamepad2,
  Wrench,
  BarChart3,
  Palette,
  Settings,
  Lightbulb,
  Star,
  Target,
  Folder,
  Globe,
  Clock,
  Terminal,
  Code,
  Music,
  Image,
  Video,
  FileText,
  Mail,
  MessageSquare,
  Calendar,
  Calculator,
  type LucideIcon,
} from "lucide-react";

// アイコン定義
export const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  rocket: Rocket,
  briefcase: Briefcase,
  gamepad: Gamepad2,
  wrench: Wrench,
  chart: BarChart3,
  palette: Palette,
  settings: Settings,
  lightbulb: Lightbulb,
  star: Star,
  target: Target,
  folder: Folder,
  globe: Globe,
  clock: Clock,
  terminal: Terminal,
  code: Code,
  music: Music,
  image: Image,
  video: Video,
  file: FileText,
  mail: Mail,
  message: MessageSquare,
  calendar: Calendar,
  calculator: Calculator,
};

export const PRESET_ICON_KEYS = Object.keys(ICON_MAP);

interface IconDisplayProps {
  iconKey: string;
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

export function IconDisplay({
  iconKey,
  size = "md",
  className = "",
}: IconDisplayProps) {
  const IconComponent = ICON_MAP[iconKey] || Zap;

  // 数値の場合はインラインスタイルを使用
  if (typeof size === "number") {
    return (
      <IconComponent
        className={className}
        style={{ width: size, height: size }}
      />
    );
  }

  return <IconComponent className={`${sizeClasses[size]} ${className}`} />;
}

interface IconPickerGridProps {
  selectedIcon: string;
  onSelect: (iconKey: string) => void;
}

export function IconPickerGrid({
  selectedIcon,
  onSelect,
}: IconPickerGridProps) {
  return (
    <div className="p-2 bg-[#3d3d3d] rounded-lg shadow-xl border border-white/10">
      <div className="grid grid-cols-6 gap-1">
        {PRESET_ICON_KEYS.map((key) => {
          const Icon = ICON_MAP[key];
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                selectedIcon === key
                  ? "bg-white/20 ring-2 ring-[#0078d4]"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <Icon className="w-5 h-5 text-gray-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
