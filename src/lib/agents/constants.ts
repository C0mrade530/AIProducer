import {
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare,
  Magnet,
  DollarSign,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react"

export interface AgentConfig {
  code: string
  name: string
  shortName: string
  icon: LucideIcon
  color: string
  bgColor: string
  borderColor: string
  step: number
  description: string
  /** What this agent produces (shown on dashboard) */
  output: string
}

export const AGENTS: AgentConfig[] = [
  {
    code: "unpacker",
    name: "Распаковщик",
    shortName: "Распаковка",
    icon: Sparkles,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20",
    step: 1,
    description: "Раскрой свою экспертность и позиционирование",
    output: "Документ распаковки",
  },
  {
    code: "methodologist",
    name: "Методолог",
    shortName: "Продукт",
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    step: 2,
    description: "Создай структуру и оффер продукта",
    output: "Продуктовый паспорт",
  },
  {
    code: "promotion",
    name: "Продвижение",
    shortName: "Контент",
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    step: 3,
    description: "Контент-план, темы и стратегия продвижения",
    output: "Контент-план",
  },
  {
    code: "warmup",
    name: "Прогревщик",
    shortName: "Прогрев",
    icon: MessageSquare,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    step: 4,
    description: "Прогрей аудиторию к покупке",
    output: "Стратегия прогрева",
  },
  {
    code: "leadmagnet",
    name: "Лид-магниты",
    shortName: "Воронки",
    icon: Magnet,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    step: 5,
    description: "Создай лид-магниты и воронки",
    output: "Карта воронок",
  },
  {
    code: "sales",
    name: "Продажник",
    shortName: "Продажи",
    icon: DollarSign,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    step: 6,
    description: "Скрипты и стратегии high-ticket продаж",
    output: "Продажный пакет",
  },
  {
    code: "tracker",
    name: "Трекер",
    shortName: "Трекинг",
    icon: CheckCircle2,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    step: 7,
    description: "Контроль прогресса и мотивация",
    output: "План действий",
  },
]

export function getAgentByCode(code: string): AgentConfig | undefined {
  return AGENTS.find((a) => a.code === code)
}
