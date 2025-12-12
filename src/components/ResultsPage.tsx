/**
 * GründerAI Results Page - Week 1 Day 4-5 Implementation (v2)
 * Learning-focused visualization of entrepreneurial personality
 * 
 * Key improvement: Replace radar chart with educational dimension cards
 * that teach users what each dimension means for THEIR business
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface DimensionData {
  percentile: number;
  level: 'high' | 'medium' | 'low';
}

interface Archetype {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  strengths: string[];
  growth_areas: string[];
}

interface Readiness {
  current: number;
  after_module_1: number;
  potential: number;
  label_de: string;
}

interface Gap {
  id: number;
  name_de: string;
  priority: 'critical' | 'high' | 'medium';
  weight: number;
  module: number;
  description: string;
}

interface CompletedItem {
  name: string;
}

interface GapAnalysisData {
  readiness: Readiness;
  gaps: Gap[];
  completed: CompletedItem[];
}

interface WorkshopResult {
  title: string;
  items: string[];
}

interface CTA {
  text: string;
  value: string;
  subvalue?: string;
  urgency: string;
  time: string;
  outcome: string;
  workshopResult?: WorkshopResult;
}

interface BusinessContext {
  type: string;
  name_de: string;
}

interface PersonalityProfile {
  archetype: Archetype;
  business_fit: number;
  dimensions: Record<string, DimensionData>;
}

interface ResultsData {
  session_id: string;
  business_context: BusinessContext;
  personality_profile: PersonalityProfile;
  gap_analysis: GapAnalysisData;
  cta: CTA;
}

interface DimensionEducation {
  icon: React.FC<IconProps>;
  color: string;
  name: string;
  question: string;
  levels: {
    high: LevelContent;
    medium: LevelContent;
    low: LevelContent;
  };
}

interface LevelContent {
  meaning: string;
  businessImpact: string;
  gzRelevance: string;
  tip: string;
}

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// ICONS (Lucide-style)
// ============================================================================

const Icon: React.FC<{ children: React.ReactNode; className?: string; size?: number; style?: React.CSSProperties }> = ({ 
  children, className = "", size = 20, style 
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>{children}</svg>
);

const Rocket: React.FC<IconProps> = (p) => <Icon {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></Icon>;
const Target: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>;
const Brain: React.FC<IconProps> = (p) => <Icon {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></Icon>;
const CheckCircle: React.FC<IconProps> = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>;
const AlertTriangle: React.FC<IconProps> = (p) => <Icon {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>;
const ArrowRight: React.FC<IconProps> = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Icon>;
const Star: React.FC<IconProps> = (p) => <Icon {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>;
const TrendingUp: React.FC<IconProps> = (p) => <Icon {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></Icon>;
const Clock: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const Shield: React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const Sparkles: React.FC<IconProps> = (p) => <Icon {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></Icon>;
const Lightbulb: React.FC<IconProps> = (p) => <Icon {...p}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></Icon>;
const Zap: React.FC<IconProps> = (p) => <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Icon>;
const Award: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></Icon>;
const Compass: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></Icon>;
const ThumbsUp: React.FC<IconProps> = (p) => <Icon {...p}><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></Icon>;
const Info: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></Icon>;
const ChevronRight: React.FC<IconProps> = (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;

// ============================================================================
// DIMENSION DATA WITH EDUCATIONAL CONTENT
// ============================================================================

const DIMENSION_EDUCATION: Record<string, DimensionEducation> = {
  innovativeness: {
    icon: Lightbulb,
    color: "#8b5cf6",
    name: "Innovationsfreude",
    question: "Wie stark suchst du nach neuen Lösungen?",
    levels: {
      high: {
        meaning: "Du siehst überall Verbesserungsmöglichkeiten und denkst in neuen Lösungen.",
        businessImpact: "Ideal für innovative Geschäftsmodelle und Differenzierung vom Wettbewerb.",
        gzRelevance: "Stärke: Die fachkundige Stelle schätzt innovative Ansätze mit klarem Kundennutzen.",
        tip: "Achte darauf, dass deine Innovation ein echtes Kundenproblem löst, nicht nur neu ist."
      },
      medium: {
        meaning: "Du kombinierst Bewährtes mit gezielten Verbesserungen.",
        businessImpact: "Gut für schrittweise Innovation und risikoarme Geschäftsmodelle.",
        gzRelevance: "Solide: Zeige, wie du bestehende Lösungen für deine Zielgruppe verbesserst.",
        tip: "Betone in deinem Businessplan die konkreten Verbesserungen gegenüber dem Status quo."
      },
      low: {
        meaning: "Du bevorzugst bewährte, etablierte Methoden.",
        businessImpact: "Stark bei traditionellen Branchen und bekannten Geschäftsmodellen.",
        gzRelevance: "Fokus: Zeige tiefe Branchenexpertise statt Innovation.",
        tip: "Deine Stärke ist Zuverlässigkeit – betone Qualität und Erfahrung."
      }
    }
  },
  risk_taking: {
    icon: Zap,
    color: "#f59e0b",
    name: "Risikobereitschaft",
    question: "Wie gehst du mit Unsicherheit um?",
    levels: {
      high: {
        meaning: "Du handelst entschlossen auch bei unvollständiger Information.",
        businessImpact: "Ermöglicht schnelle Markteintritte und First-Mover-Vorteile.",
        gzRelevance: "Vorteil: Du traust dir die Selbstständigkeit zu. Zeige aber auch Absicherung.",
        tip: "Ergänze deine Risikofreude mit einem soliden Finanzpuffer im Businessplan."
      },
      medium: {
        meaning: "Du wägst Chancen und Risiken sorgfältig ab.",
        businessImpact: "Führt zu durchdachten Entscheidungen mit kalkuliertem Risiko.",
        gzRelevance: "Ideal: Die fachkundige Stelle will sehen, dass du Risiken kennst UND managst.",
        tip: "Dein ausgewogener Ansatz ist eine Stärke – zeige ihn im Risikomanagement-Kapitel."
      },
      low: {
        meaning: "Du bevorzugst Sicherheit und ausführliche Planung.",
        businessImpact: "Stärke bei kapitalintensiven oder regulierten Branchen.",
        gzRelevance: "Vorsicht: Selbstständigkeit braucht Handlungsfähigkeit bei Unsicherheit.",
        tip: "Baue Entscheidungsroutinen ein, die dir helfen, trotz Unsicherheit zu handeln."
      }
    }
  },
  achievement_orientation: {
    icon: Award,
    color: "#10b981",
    name: "Leistungsorientierung",
    question: "Wie stark treibt dich der Wunsch nach Erfolg?",
    levels: {
      high: {
        meaning: "Du setzt dir ambitionierte Ziele und arbeitest konsequent darauf hin.",
        businessImpact: "Treibt Wachstum und kontinuierliche Verbesserung.",
        gzRelevance: "Stärke: Ambitionierte, aber realistische Ziele überzeugen die Prüfer.",
        tip: "Zeige messbare Meilensteine im Businessplan – das passt zu deinem Stil."
      },
      medium: {
        meaning: "Du balancierst Leistung mit anderen Lebensbereichen.",
        businessImpact: "Fördert nachhaltige Arbeitsweisen ohne Burnout-Risiko.",
        gzRelevance: "Solide: Zeige trotzdem klare Geschäftsziele für die ersten 3 Jahre.",
        tip: "Work-Life-Balance ist gut, aber der Businessplan braucht ambitionierte Zahlen."
      },
      low: {
        meaning: "Erfolg ist für dich mehr als nur Geschäftskennzahlen.",
        businessImpact: "Gut für Purpose-getriebene Geschäftsmodelle und Sozialunternehmen.",
        gzRelevance: "Achtung: Die fachkundige Stelle will Wirtschaftlichkeit sehen.",
        tip: "Formuliere deinen Purpose als Geschäftsmodell mit messbaren Ergebnissen."
      }
    }
  },
  autonomy_orientation: {
    icon: Compass,
    color: "#3b82f6",
    name: "Autonomiestreben",
    question: "Wie wichtig ist dir Unabhängigkeit?",
    levels: {
      high: {
        meaning: "Du willst selbst entscheiden, wie, wann und woran du arbeitest.",
        businessImpact: "Perfekt für Solo-Selbstständigkeit und eigene Firma.",
        gzRelevance: "Kernmotivation: Genau das, was der Gründungszuschuss fördern soll!",
        tip: "Diese Motivation ist deine Stärke – kommuniziere sie klar im Businessplan."
      },
      medium: {
        meaning: "Du schätzt Unabhängigkeit, aber auch Zusammenarbeit.",
        businessImpact: "Gut für Partnerschaften und Team-Gründungen.",
        gzRelevance: "Flexibel: Zeige, dass DU die treibende Kraft bist, auch mit Partnern.",
        tip: "Bei Team-Gründungen: Mache deine eigene Rolle und Entscheidungsmacht klar."
      },
      low: {
        meaning: "Du arbeitest gerne in strukturierten Umgebungen mit klaren Vorgaben.",
        businessImpact: "Franchise oder etablierte Geschäftsmodelle könnten passen.",
        gzRelevance: "Prüfe ehrlich: Ist Selbstständigkeit wirklich das Richtige für dich?",
        tip: "Wenn ja, wähle ein strukturiertes Modell wie Franchise oder Agentur."
      }
    }
  },
  proactiveness: {
    icon: TrendingUp,
    color: "#ec4899",
    name: "Proaktivität",
    question: "Handelst du vorausschauend oder reagierst du auf Situationen?",
    levels: {
      high: {
        meaning: "Du antizipierst Chancen und handelst, bevor es andere tun.",
        businessImpact: "Ermöglicht Marktführerschaft und strategische Positionierung.",
        gzRelevance: "Stärke: Du zeigst Initiative – genau was Selbstständigkeit braucht.",
        tip: "Zeige im Businessplan, welche Marktchancen du JETZT ergreifst."
      },
      medium: {
        meaning: "Du reagierst schnell auf Veränderungen, aber planst auch voraus.",
        businessImpact: "Balanciert strategisches Denken mit Anpassungsfähigkeit.",
        gzRelevance: "Gut: Zeige sowohl Vision als auch Reaktionsfähigkeit.",
        tip: "Beschreibe, wie du auf Marktveränderungen reagieren würdest."
      },
      low: {
        meaning: "Du beobachtest erst und handelst dann.",
        businessImpact: "Vermeidet Fehlinvestitionen, aber kann Chancen verpassen.",
        gzRelevance: "Achtung: Die Arbeitsagentur fördert aktive Gründer, nicht Abwartende.",
        tip: "Zeige konkrete erste Schritte, die du BEREITS unternommen hast."
      }
    }
  },
  locus_of_control: {
    icon: Target,
    color: "#06b6d4",
    name: "Kontrollüberzeugung",
    question: "Glaubst du, dass du dein Schicksal selbst bestimmst?",
    levels: {
      high: {
        meaning: "Du glaubst fest daran, dass dein Erfolg von DEINEN Handlungen abhängt.",
        businessImpact: "Treibt Eigenverantwortung und lösungsorientiertes Handeln.",
        gzRelevance: "Ideal: Diese Einstellung ist DER Erfolgsfaktor für Selbstständige.",
        tip: "Zeige diese Überzeugung im Businessplan – du machst den Unterschied!"
      },
      medium: {
        meaning: "Du siehst sowohl eigene Handlungen als auch externe Faktoren als wichtig.",
        businessImpact: "Realistisches Weltbild mit guter Risikoeinschätzung.",
        gzRelevance: "Solide: Zeige, wie du auf externe Faktoren vorbereitet bist.",
        tip: "Erwähne im Risikomanagement, wie du mit externen Einflüssen umgehst."
      },
      low: {
        meaning: "Du siehst externe Faktoren als stark bestimmend für deinen Erfolg.",
        businessImpact: "Kann zu Passivität führen, wenn Schwierigkeiten auftreten.",
        gzRelevance: "Kritisch: Selbstständige brauchen Glauben an die eigene Wirksamkeit.",
        tip: "Reflektiere: Welche Erfolge hast du durch EIGENES Handeln erreicht?"
      }
    }
  },
  self_efficacy: {
    icon: ThumbsUp,
    color: "#84cc16",
    name: "Selbstwirksamkeit",
    question: "Wie sehr vertraust du auf deine Fähigkeiten?",
    levels: {
      high: {
        meaning: "Du vertraust darauf, Herausforderungen meistern zu können.",
        businessImpact: "Ermöglicht mutige Entscheidungen und Durchhaltevermögen.",
        gzRelevance: "Stärke: Dieses Selbstvertrauen strahlt im Businessplan aus.",
        tip: "Untermauere dein Selbstvertrauen mit konkreten Erfolgsbeispielen."
      },
      medium: {
        meaning: "Du vertraust auf deine Kernkompetenzen, siehst aber auch Lernbedarf.",
        businessImpact: "Fördert kontinuierliches Lernen und realistische Selbsteinschätzung.",
        gzRelevance: "Gut: Zeige, wie du fehlende Skills durch Lernen oder Partner ergänzt.",
        tip: "Erwähne geplante Weiterbildungen oder strategische Partnerschaften."
      },
      low: {
        meaning: "Du zweifelst oft an deinen Fähigkeiten.",
        businessImpact: "Kann zu Zögern führen und Chancen kosten.",
        gzRelevance: "Achtung: Die Prüfer wollen überzeugte Gründer sehen.",
        tip: "Liste deine bisherigen Erfolge auf – du hast mehr erreicht als du denkst!"
      }
    }
  }
};

// ============================================================================
// MOCK DATA (Replace with API call)
// ============================================================================

const MOCK_RESULTS: ResultsData = {
  session_id: "demo-session-123",
  business_context: {
    type: "consulting",
    name_de: "Unternehmensberatung"
  },
  personality_profile: {
    archetype: {
      id: "bold_innovator",
      name: "Mutiger Innovator",
      emoji: "🚀",
      color: "#E53E3E",
      description: "Du siehst Möglichkeiten, wo andere Risiken sehen. Deine Kombination aus Innovationsfreude und Risikobereitschaft macht dich zum idealen Gründer für disruptive Geschäftsmodelle.",
      strengths: [
        "Erkennt neue Geschäftsmöglichkeiten schnell",
        "Handelt auch bei Unsicherheit entschlossen",
        "Bringt frische Ideen in etablierte Märkte"
      ],
      growth_areas: [
        "Manchmal zu schnelles Handeln ohne Absicherung",
        "Detailplanung kann zu kurz kommen"
      ]
    },
    business_fit: 85,
    dimensions: {
      innovativeness: { percentile: 88, level: "high" },
      risk_taking: { percentile: 79, level: "high" },
      achievement_orientation: { percentile: 82, level: "high" },
      autonomy_orientation: { percentile: 84, level: "high" },
      proactiveness: { percentile: 69, level: "medium" },
      locus_of_control: { percentile: 76, level: "high" },
      self_efficacy: { percentile: 73, level: "medium" }
    }
  },
  gap_analysis: {
    readiness: { current: 35, after_module_1: 55, potential: 95, label_de: "Grundlage geschaffen" },
    gaps: [
      { id: 1, name_de: "Vision & Problemdefinition", priority: "critical", weight: 20, module: 1, description: "Deine Geschäftsidee präzise formulieren" },
      { id: 2, name_de: "Marktanalyse", priority: "critical", weight: 15, module: 2, description: "Nachweis der Marktchancen" },
      { id: 3, name_de: "Marketing & Vertrieb", priority: "high", weight: 10, module: 3, description: "Kundengewinnung" },
      { id: 4, name_de: "Finanzplan", priority: "critical", weight: 20, module: 4, description: "3-Jahres-Projektion" }
    ],
    completed: [{ name: "Persönlichkeitsprofil" }, { name: "Geschäftskontext" }]
  },
  cta: {
    text: "Starte deinen Weg zum fertigen Businessplan",
    value: "Komplett & einreichbereit für deinen Gründungszuschuss",
    subvalue: "Bis zu €20.000 steuerfreie Förderung sichern",
    urgency: "Modul 1 kostenlos testen",
    time: "20-25 Min",
    outcome: "Am Ende des Workshops hast du einen vollständigen, professionellen Businessplan – personalisiert für dein Geschäft und optimiert für die fachkundige Stelle.",
    workshopResult: {
      title: "Das bekommst du am Ende:",
      items: [
        "Vollständiger Businessplan (25-30 Seiten)",
        "Finanzplan mit 3-Jahres-Projektion",
        "Personalisiert auf deine Stärken",
        "Optimiert für GZ-Genehmigung"
      ]
    }
  }
};

// ============================================================================
// DIMENSION CARD COMPONENT (Educational)
// ============================================================================

interface DimensionCardProps {
  dimensionKey: string;
  data: DimensionData;
  isExpanded: boolean;
  onToggle: () => void;
}

const DimensionCard: React.FC<DimensionCardProps> = ({ dimensionKey, data, isExpanded, onToggle }) => {
  const education = DIMENSION_EDUCATION[dimensionKey];
  if (!education) return null;
  
  const levelData = education.levels[data.level];
  const IconComponent = education.icon;
  
  const getPercentileLabel = (p: number) => {
    if (p >= 80) return { text: "Sehr ausgeprägt", color: "text-emerald-400", bg: "bg-emerald-400/10" };
    if (p >= 60) return { text: "Ausgeprägt", color: "text-blue-400", bg: "bg-blue-400/10" };
    if (p >= 40) return { text: "Moderat", color: "text-amber-400", bg: "bg-amber-400/10" };
    return { text: "Weniger ausgeprägt", color: "text-orange-400", bg: "bg-orange-400/10" };
  };
  
  const label = getPercentileLabel(data.percentile);
  
  return (
    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden transition-all duration-300">
      {/* Header - Always visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/60 transition-colors text-left"
      >
        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${education.color}20` }}
        >
          <IconComponent size={24} style={{ color: education.color }} />
        </div>
        
        {/* Name & Score */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{education.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${label.color} ${label.bg}`}>
              {label.text}
            </span>
          </div>
          <p className="text-sm text-slate-400 truncate">{education.question}</p>
        </div>
        
        {/* Score Bar */}
        <div className="w-24 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-lg font-bold text-white">{data.percentile}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${data.percentile}%`,
                backgroundColor: education.color
              }}
            />
          </div>
        </div>
        
        {/* Expand icon */}
        <ChevronRight 
          size={20} 
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>
      
      {/* Expanded Content - Educational */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-700/50">
          <div className="pt-4 grid gap-3">
            {/* What this means */}
            <div className="bg-slate-900/50 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Was das bedeutet</p>
                  <p className="text-sm text-slate-200">{levelData.meaning}</p>
                </div>
              </div>
            </div>
            
            {/* Business Impact */}
            <div className="bg-slate-900/50 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Rocket size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Für dein Geschäft</p>
                  <p className="text-sm text-slate-200">{levelData.businessImpact}</p>
                </div>
              </div>
            </div>
            
            {/* GZ Relevance */}
            <div className="bg-slate-900/50 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Target size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Für deinen GZ-Antrag</p>
                  <p className="text-sm text-slate-200">{levelData.gzRelevance}</p>
                </div>
              </div>
            </div>
            
            {/* Actionable Tip */}
            <div 
              className="rounded-xl p-3 border"
              style={{ 
                backgroundColor: `${education.color}10`,
                borderColor: `${education.color}30`
              }}
            >
              <div className="flex items-start gap-2">
                <Lightbulb size={16} style={{ color: education.color }} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: education.color }}>Tipp</p>
                  <p className="text-sm text-slate-200">{levelData.tip}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// DIMENSION OVERVIEW (Summary Bar Chart)
// ============================================================================

interface DimensionOverviewProps {
  dimensions: Record<string, DimensionData>;
  onSelectDimension: (key: string) => void;
}

const DimensionOverview: React.FC<DimensionOverviewProps> = ({ dimensions, onSelectDimension }) => {
  const sortedDimensions = Object.entries(dimensions)
    .map(([key, data]) => ({
      key,
      ...data,
      ...DIMENSION_EDUCATION[key]
    }))
    .filter(dim => dim.name) // Filter out any missing education data
    .sort((a, b) => b.percentile - a.percentile);
  
  return (
    <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Brain size={18} className="text-purple-400" />
          Dein Gründer-Profil auf einen Blick
        </h3>
        <span className="text-xs text-slate-400">Tippe für Details</span>
      </div>
      
      <div className="space-y-3">
        {sortedDimensions.map(dim => {
          const IconComponent = dim.icon;
          return (
            <button
              key={dim.key}
              onClick={() => onSelectDimension(dim.key)}
              className="w-full flex items-center gap-3 group hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-colors"
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${dim.color}20` }}
              >
                <IconComponent size={16} style={{ color: dim.color }} />
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-200 group-hover:text-white transition-colors">
                    {dim.name}
                  </span>
                  <span className="text-sm font-semibold text-white">{dim.percentile}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${dim.percentile}%`,
                      backgroundColor: dim.color
                    }}
                  />
                </div>
              </div>
              
              <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 transition-colors flex-shrink-0" />
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-slate-500 mt-4 text-center">
        Basierend auf Howard's validiertem Entrepreneurial Personality Framework
      </p>
    </div>
  );
};

// ============================================================================
// ARCHETYPE HERO
// ============================================================================

interface ArchetypeHeroProps {
  archetype: Archetype;
  businessFit: number;
}

const ArchetypeHero: React.FC<ArchetypeHeroProps> = ({ archetype, businessFit }) => (
  <div 
    className="relative overflow-hidden rounded-2xl p-5"
    style={{ 
      background: `linear-gradient(135deg, ${archetype.color}15 0%, ${archetype.color}05 100%)`,
      borderLeft: `4px solid ${archetype.color}`
    }}
  >
    <div className="flex items-center gap-3 mb-3">
      <span className="text-4xl">{archetype.emoji}</span>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider">Dein Unternehmertyp</p>
        <h2 className="text-xl md:text-2xl font-bold text-white">{archetype.name}</h2>
      </div>
    </div>
    <p className="text-slate-300 text-sm leading-relaxed mb-4">{archetype.description}</p>
    <div className="flex items-center gap-2 bg-slate-800/50 rounded-full px-3 py-1.5 w-fit">
      <Target size={16} style={{ color: archetype.color }} />
      <span className="text-white font-semibold text-sm">{businessFit}%</span>
      <span className="text-slate-400 text-xs">Business Fit</span>
    </div>
  </div>
);

// ============================================================================
// READINESS SCORE
// ============================================================================

interface ReadinessScoreProps {
  readiness: Readiness;
}

const ReadinessScore: React.FC<ReadinessScoreProps> = ({ readiness }) => {
  const circ = 2 * Math.PI * 40;
  const offset = circ - (readiness.current / 100) * circ;
  
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700">
      <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <Target size={18} className="text-amber-400" />
        GZ-Readiness Score
      </h3>
      
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="#334155" strokeWidth="8" fill="none" />
            <circle cx="48" cy="48" r="40" stroke="url(#grad)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
            <defs><linearGradient id="grad"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#eab308" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{readiness.current}%</span>
            <span className="text-xs text-slate-400">aktuell</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-slate-400">Nach Modul 1</span><span className="text-amber-400 font-semibold">{readiness.after_module_1}%</span></div>
        <div className="h-1.5 bg-slate-700 rounded-full"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${readiness.after_module_1}%` }} /></div>
        <div className="flex justify-between mt-2"><span className="text-slate-400">Potenzial</span><span className="text-emerald-400 font-semibold">{readiness.potential}%</span></div>
        <div className="h-1.5 bg-slate-700 rounded-full"><div className="h-full bg-emerald-500/40 rounded-full" style={{ width: `${readiness.potential}%` }} /></div>
      </div>
      <p className="text-xs text-slate-400 mt-3 text-center">{readiness.label_de}</p>
    </div>
  );
};

// ============================================================================
// GAP ANALYSIS
// ============================================================================

interface GapAnalysisProps {
  gaps: Gap[];
  completed: CompletedItem[];
}

const GapAnalysis: React.FC<GapAnalysisProps> = ({ gaps, completed }) => (
  <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
    <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
      <AlertTriangle size={18} className="text-amber-400" />
      Was dir noch fehlt
    </h3>
    
    <div className="mb-4">
      <p className="text-xs text-slate-400 mb-2">✓ Erledigt</p>
      <div className="flex flex-wrap gap-2">
        {completed.map((c, i) => (
          <span key={i} className="flex items-center gap-1 bg-emerald-400/10 text-emerald-400 px-2 py-1 rounded-full text-xs border border-emerald-400/30">
            <CheckCircle size={12} />{c.name}
          </span>
        ))}
      </div>
    </div>
    
    <div className="space-y-2">
      {gaps.slice(0, 4).map((gap, i) => (
        <div key={gap.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-300 font-semibold">{i+1}</div>
              <div>
                <p className="font-medium text-white text-sm">{gap.name_de}</p>
                <p className="text-xs text-slate-400">{gap.description}</p>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${gap.priority === 'critical' ? 'text-red-400 bg-red-400/10 border-red-400/30' : 'text-orange-400 bg-orange-400/10 border-orange-400/30'}`}>
              {gap.priority === 'critical' ? 'Kritisch' : 'Hoch'}
            </span>
          </div>
          <div className="flex gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Target size={12} />+{gap.weight}%</span>
            <span>Modul {gap.module}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// MODULE 1 CTA - Outcome Focused
// ============================================================================

interface Module1CTAProps {
  cta: CTA;
  accentColor: string;
  businessType?: string;
}

const Module1CTA: React.FC<Module1CTAProps> = ({ cta, accentColor, businessType }) => {
  const [clicked, setClicked] = useState(false);
  
  return (
    <div className="space-y-4">
      {/* Main CTA Card */}
      <div 
        className="relative overflow-hidden rounded-2xl p-5 md:p-6 border-2"
        style={{ 
          background: `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}05 100%)`,
          borderColor: accentColor
        }}
      >
        <div className="absolute top-3 right-3"><Sparkles size={20} style={{ color: accentColor, opacity: 0.7 }} /></div>
        
        {/* Badge */}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold mb-3" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
          <Star size={12} />{cta.urgency}
        </span>
        
        {/* Main Headline */}
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{cta.text}</h3>
        
        {/* Value Proposition - The Big Promise */}
        <p className="text-lg md:text-xl font-semibold mb-1" style={{ color: accentColor }}>{cta.value}</p>
        
        {/* Sub-value with amount */}
        {cta.subvalue && (
          <p className="text-base font-medium text-amber-400 mb-4">{cta.subvalue}</p>
        )}
        
        {/* Outcome Description */}
        <p className="text-slate-300 text-sm mb-5 leading-relaxed">{cta.outcome}</p>
        
        {/* What You Get - Workshop Results */}
        {cta.workshopResult && (
          <div className="bg-slate-900/50 rounded-xl p-4 mb-5">
            <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              {cta.workshopResult.title}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cta.workshopResult.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Module 1 Preview Info */}
        <div className="flex flex-wrap gap-3 mb-5 text-sm text-slate-300">
          <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full">
            <Clock size={14} className="text-slate-400" />
            {cta.time} für Modul 1
          </span>
          <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-full">
            <Brain size={14} className="text-slate-400" />
            KI-Coaching erleben
          </span>
          <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30">
            <Shield size={14} />
            100% kostenlos
          </span>
        </div>
        
        {/* CTA Button */}
        <button 
          onClick={() => setClicked(true)}
          className="w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
          style={{ 
            background: clicked ? '#10b981' : `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
            boxShadow: `0 10px 40px ${accentColor}30`
          }}
        >
          {clicked ? (
            <><CheckCircle size={22} />Wird geladen...</>
          ) : (
            <><Rocket size={22} />Kostenlos starten<ArrowRight size={20} /></>
          )}
        </button>
        
        {/* Trust Element */}
        <p className="text-xs text-slate-500 mt-4 text-center">
          Keine Kreditkarte · Keine Verpflichtung · Sofort loslegen
        </p>
      </div>
      
      {/* Social Proof / Outcome Preview */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <Target size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-white font-medium mb-1">
              Dein Ziel: Gründungszuschuss sichern
            </p>
            <p className="text-xs text-slate-400">
              Bis zu €20.000 steuerfreie Förderung – mit einem professionellen Businessplan, der auf dein {businessType || "Geschäft"} und deine Persönlichkeit zugeschnitten ist. 
              Der Workshop führt dich Schritt für Schritt – von der Vision bis zum einreichfertigen Dokument.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STRENGTHS & GROWTH
// ============================================================================

interface StrengthsAndGrowthProps {
  archetype: Archetype;
}

const StrengthsAndGrowth: React.FC<StrengthsAndGrowthProps> = ({ archetype }) => (
  <div className="grid md:grid-cols-2 gap-4">
    <div className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20">
      <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2"><CheckCircle size={16} />Deine Stärken</h3>
      <ul className="space-y-2">{archetype.strengths.map((s, i) => <li key={i} className="flex items-start gap-2 text-slate-300 text-sm"><span className="text-emerald-400">✓</span>{s}</li>)}</ul>
    </div>
    <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/20">
      <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2"><TrendingUp size={16} />Entwicklungsfelder</h3>
      <ul className="space-y-2">{archetype.growth_areas.map((a, i) => <li key={i} className="flex items-start gap-2 text-slate-300 text-sm"><span className="text-amber-400">→</span>{a}</li>)}</ul>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ResultsPageProps {
  sessionId?: string;
  resultsData?: ResultsData;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ sessionId, resultsData }) => {
  const [loading, setLoading] = useState(true);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
  const [results, setResults] = useState<ResultsData | null>(resultsData || null);

  // Use provided data or fetch from API
  useEffect(() => {
    if (resultsData) {
      setResults(resultsData);
      setLoading(false);
      return;
    }
    
    // TODO: Fetch from API using sessionId
    // For now, use mock data
    const timer = setTimeout(() => {
      setResults(MOCK_RESULTS);
      setLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [sessionId, resultsData]);

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-300">Deine Ergebnisse werden geladen...</p>
      </div>
    </div>
  );

  if (!results) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-slate-400">Keine Ergebnisse gefunden.</p>
    </div>
  );

  const { personality_profile: p, gap_analysis: g, cta } = results;
  const color = p.archetype.color;

  const handleSelectDimension = (key: string) => {
    setExpandedDimension(key);
    setViewMode('detail');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Rocket size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">GründerAI</span>
          </div>
          <span className="text-xs text-slate-400">Dein Gründerprofil</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Hero */}
        <section className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Dein Unternehmer-Profil ist fertig! 🎉</h1>
          <p className="text-slate-400 text-sm">Entdecke deine 7 Gründer-Dimensionen und was sie für dich bedeuten</p>
        </section>

        {/* Archetype */}
        <ArchetypeHero archetype={p.archetype} businessFit={p.business_fit} />

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'overview' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            Übersicht
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'detail' 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            Detailanalyse
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-5 gap-5">
          {/* Left Column - Dimensions */}
          <div className="lg:col-span-3 space-y-4">
            {viewMode === 'overview' ? (
              <DimensionOverview 
                dimensions={p.dimensions} 
                onSelectDimension={handleSelectDimension}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">
                  Klicke auf eine Dimension, um zu erfahren, was sie für dich und dein Geschäft bedeutet:
                </p>
                {Object.entries(p.dimensions).map(([key, data]) => (
                  <DimensionCard
                    key={key}
                    dimensionKey={key}
                    data={data}
                    isExpanded={expandedDimension === key}
                    onToggle={() => setExpandedDimension(expandedDimension === key ? null : key)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-4">
            <ReadinessScore readiness={g.readiness} />
            <GapAnalysis gaps={g.gaps} completed={g.completed} />
          </div>
        </div>

        {/* Strengths & Growth */}
        <StrengthsAndGrowth archetype={p.archetype} />

        {/* CTA */}
        <Module1CTA cta={cta} accentColor={color} businessType={results.business_context.name_de} />

        {/* Footer */}
        <footer className="text-center py-6 border-t border-slate-800">
          <p className="text-slate-500 text-xs">Basierend auf Howard's validiertem Entrepreneurial Personality Framework (2024)</p>
          <p className="text-slate-600 text-xs mt-1">© 2025 GründerAI by PrincipAI UG</p>
        </footer>
      </main>
    </div>
  );
};

export default ResultsPage;