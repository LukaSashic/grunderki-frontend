/**
 * GründerAI Assessment - Complete Flow Component
 * 
 * Flow: Welcome → Name → Email → BusinessContext (Smart Defaults) → ScenarioAssessment → Results
 * 
 * Features:
 * - Ansatz 2: Smart Defaults for Business Context
 * - Scenario-based A/B/C/D personality assessment
 * - Dark/Light theme support
 * - Smooth transitions with CSS animations
 * - Progress bar with micro-insights
 * - Mobile-responsive design
 * 
 * @version 2.0.0
 * @author GründerAI Team
 */

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';

// ============================================================================
// THEME CONTEXT
// ============================================================================

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ============================================================================
// TYPES
// ============================================================================

type Stage = 
  | 'welcome' 
  | 'name' 
  | 'email' 
  | 'business_category' 
  | 'business_defaults' 
  | 'business_customize'
  | 'scenarios' 
  | 'results';

interface BusinessContext {
  category: string;
  categoryLabel: string;
  targetCustomer: string;
  targetCustomerLabel: string;
  stage: string;
  stageLabel: string;
  usedDefaults: boolean;
}

interface ScenarioOption {
  id: string;
  text: string;
}

interface Scenario {
  scenario_id: string;
  dimension?: string; // Hidden from user
  situation: string;
  question: string;
  options: ScenarioOption[];
}

interface Progress {
  current_item: number;
  estimated_total: number;
  percentage: number;
  dimensions_assessed: number;
  total_dimensions: number;
}

interface MicroInsight {
  title: string;
  message: string;
  icon: string;
}

interface AssessmentResults {
  personality_profile: {
    archetype_id: string;
    archetype_name: string;
    tagline: string;
    description: string;
    primary_strengths: string[];
    primary_challenges: string[];
    gz_success_prediction: number;
  };
  dimension_scores: Record<string, {
    theta: number;
    percentile: number;
    label: string;
  }>;
  gap_analysis: {
    priority_gaps: Array<{
      dimension: string;
      current_percentile: number;
      target_percentile: number;
      urgency: string;
    }>;
    overall_readiness: number;
  };
  radar_chart_data: Array<{
    dimension: string;
    label: string;
    score: number;
    benchmark: number;
  }>;
}

// ============================================================================
// SMART DEFAULTS DATA (Ansatz 2)
// ============================================================================

interface CategoryOption {
  id: string;
  label: string;
  emoji: string;
  hint: string;
}

interface SmartDefault {
  customer: string;
  customerLabel: string;
  stage: string;
  stageLabel: string;
  confidence: number;
  insight: string;
}

const BUSINESS_CATEGORIES: CategoryOption[] = [
  { id: 'consulting', label: 'Beratung / Coaching', emoji: '💼', hint: 'Unternehmensberatung, Life Coaching, Training' },
  { id: 'tech', label: 'Tech / Software', emoji: '💻', hint: 'Apps, SaaS, Webentwicklung, IT-Services' },
  { id: 'ecommerce', label: 'E-Commerce / Handel', emoji: '🛒', hint: 'Online-Shop, Dropshipping, Retail' },
  { id: 'service', label: 'Dienstleistung', emoji: '🛠️', hint: 'Handwerk, Reparatur, Haushaltsservices' },
  { id: 'creative', label: 'Kreativ / Design', emoji: '🎨', hint: 'Grafik, Foto, Video, Marketing' },
  { id: 'health', label: 'Gesundheit / Wellness', emoji: '💪', hint: 'Fitness, Ernährung, Therapie, Pflege' },
  { id: 'gastro', label: 'Gastronomie / Food', emoji: '🍽️', hint: 'Restaurant, Catering, Food Truck' },
  { id: 'education', label: 'Bildung / Training', emoji: '📚', hint: 'Kurse, Nachhilfe, Workshops' },
];

const SMART_DEFAULTS: Record<string, SmartDefault> = {
  consulting: {
    customer: 'b2b_small',
    customerLabel: 'Kleine & mittlere Unternehmen',
    stage: 'idea',
    stageLabel: 'Ideenphase',
    confidence: 0.75,
    insight: '75% der Berater starten mit B2B-Kunden'
  },
  tech: {
    customer: 'b2b_mixed',
    customerLabel: 'Unternehmen verschiedener Größen',
    stage: 'idea',
    stageLabel: 'Ideenphase',
    confidence: 0.70,
    insight: 'Tech-Gründer haben oft schon erste Prototypen'
  },
  ecommerce: {
    customer: 'b2c_mixed',
    customerLabel: 'Endverbraucher (B2C)',
    stage: 'planning',
    stageLabel: 'In der Planung',
    confidence: 0.65,
    insight: 'E-Commerce startet meist mit klarer Nische'
  },
  service: {
    customer: 'b2c_mixed',
    customerLabel: 'Privatpersonen & Haushalte',
    stage: 'idea',
    stageLabel: 'Ideenphase',
    confidence: 0.70,
    insight: 'Lokale Dienstleister haben oft schon Netzwerke'
  },
  creative: {
    customer: 'b2b_small',
    customerLabel: 'Kleine Unternehmen & Startups',
    stage: 'idea',
    stageLabel: 'Ideenphase',
    confidence: 0.72,
    insight: 'Kreative bringen meist Portfolio-Erfahrung mit'
  },
  health: {
    customer: 'b2c_professionals',
    customerLabel: 'Berufstätige & Gesundheitsbewusste',
    stage: 'planning',
    stageLabel: 'In der Planung',
    confidence: 0.68,
    insight: 'Gesundheitsbranche erfordert oft Zertifikate'
  },
  gastro: {
    customer: 'b2c_families',
    customerLabel: 'Familien & lokale Gemeinschaft',
    stage: 'planning',
    stageLabel: 'In der Planung',
    confidence: 0.80,
    insight: 'Gastro braucht Standort & Konzept zuerst'
  },
  education: {
    customer: 'b2c_mixed',
    customerLabel: 'Lernwillige aller Altersgruppen',
    stage: 'idea',
    stageLabel: 'Ideenphase',
    confidence: 0.65,
    insight: 'Online-Bildung wächst stark'
  },
};

const CUSTOMER_OPTIONS = [
  { id: 'b2b_small', label: 'Kleine Unternehmen (KMU)', emoji: '🏢' },
  { id: 'b2b_large', label: 'Größere Unternehmen', emoji: '🏛️' },
  { id: 'b2b_mixed', label: 'Unternehmen verschiedener Größen', emoji: '🏗️' },
  { id: 'b2c_families', label: 'Familien', emoji: '👨‍👩‍👧‍👦' },
  { id: 'b2c_young', label: 'Junge Erwachsene (18-35)', emoji: '👩‍💻' },
  { id: 'b2c_professionals', label: 'Berufstätige', emoji: '👔' },
  { id: 'b2c_mixed', label: 'Verschiedene Privatpersonen', emoji: '🌈' },
];

const STAGE_OPTIONS = [
  { id: 'idea', label: 'Nur eine Idee', emoji: '💡' },
  { id: 'planning', label: 'In der Planung', emoji: '📝' },
  { id: 'prototype', label: 'Erste Tests / Prototyp', emoji: '🔧' },
  { id: 'mvp', label: 'Erste Kunden', emoji: '🚀' },
];

// ============================================================================
// MICRO INSIGHTS (shown every 3rd question)
// ============================================================================

const MICRO_INSIGHTS: MicroInsight[] = [
  { 
    title: 'Starke Tendenz erkannt!', 
    message: 'Deine bisherigen Antworten zeigen ein klares Muster.', 
    icon: '🎯' 
  },
  { 
    title: 'Interessante Kombination', 
    message: 'Diese Eigenschaften sind bei erfolgreichen Gründern selten.', 
    icon: '💎' 
  },
  { 
    title: 'Typisch für deine Branche', 
    message: 'Dein Profil passt gut zu deinem Geschäftsbereich.', 
    icon: '📊' 
  },
  { 
    title: 'Fast geschafft!', 
    message: 'Nur noch wenige Fragen bis zu deinem Ergebnis.', 
    icon: '🏁' 
  },
];

// ============================================================================
// ICONS
// ============================================================================

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

// ============================================================================
// STYLES
// ============================================================================

const getThemeStyles = (theme: Theme) => ({
  container: theme === 'dark' 
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'
    : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900',
  card: theme === 'dark'
    ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm'
    : 'bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg',
  input: theme === 'dark'
    ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20'
    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20',
  button: {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25',
    secondary: theme === 'dark'
      ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300',
    option: theme === 'dark'
      ? 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 hover:border-emerald-500/50'
      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-500/50 shadow-sm',
    optionSelected: 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/30',
  },
  text: {
    primary: theme === 'dark' ? 'text-white' : 'text-slate-900',
    secondary: theme === 'dark' ? 'text-slate-400' : 'text-slate-600',
    muted: theme === 'dark' ? 'text-slate-500' : 'text-slate-400',
  },
  progress: {
    bg: theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200',
    fill: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  },
});

// ============================================================================
// API SERVICE
// ============================================================================

interface ApiResponse {
  session_id?: string;
  complete: boolean;
  phase: string;
  scenario?: Scenario;
  progress?: Progress;
  micro_insight?: { title: string; message: string };
  results?: AssessmentResults;
  message?: string;
}

const apiCall = async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<ApiResponse> => {
  const config: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Theme Toggle Button
const ThemeToggle: React.FC<{ theme: Theme; onToggle: () => void }> = ({ theme, onToggle }) => (
  <button
    onClick={onToggle}
    className="fixed top-4 right-4 z-50 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 
               border border-slate-700/50 transition-all duration-200"
    aria-label="Toggle theme"
  >
    {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
  </button>
);

// Progress Bar
const ProgressBar: React.FC<{ progress: Progress; theme: Theme }> = ({ progress, theme }) => {
  const styles = getThemeStyles(theme);
  
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between text-sm mb-2">
        <span className={styles.text.secondary}>
          Frage {progress.current_item} von {progress.estimated_total}
        </span>
        <span className={styles.text.secondary}>
          {progress.percentage}%
        </span>
      </div>
      <div className={`h-2 rounded-full ${styles.progress.bg}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${styles.progress.fill}`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
};

// Micro Insight Card
const MicroInsightCard: React.FC<{ insight: MicroInsight; theme: Theme; onDismiss: () => void }> = ({ 
  insight, theme, onDismiss 
}) => {
  const styles = getThemeStyles(theme);
  
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  return (
    <div className={`
      fixed top-20 left-1/2 -translate-x-1/2 z-40
      px-6 py-4 rounded-2xl ${styles.card} border
      shadow-xl animate-slide-down
      max-w-sm w-full mx-4
    `}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{insight.icon}</span>
        <div>
          <p className={`font-semibold ${styles.text.primary}`}>{insight.title}</p>
          <p className={`text-sm ${styles.text.secondary}`}>{insight.message}</p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STAGE COMPONENTS
// ============================================================================

// Welcome Screen
const WelcomeScreen: React.FC<{ theme: Theme; onContinue: () => void }> = ({ theme, onContinue }) => {
  const styles = getThemeStyles(theme);
  
  return (
    <div className="text-center animate-fade-in">
      <div className="mb-8">
        <span className="text-6xl mb-4 block">🚀</span>
        <h1 className={`text-4xl font-bold mb-4 ${styles.text.primary}`}>
          Willkommen bei GründerAI
        </h1>
        <p className={`text-xl ${styles.text.secondary} max-w-md mx-auto`}>
          Entdecke dein Gründer-Profil und erhalte personalisierte Empfehlungen 
          für deinen Gründungszuschuss-Antrag.
        </p>
      </div>
      
      <div className={`${styles.card} rounded-2xl p-6 mb-8 border max-w-md mx-auto`}>
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="text-2xl block mb-1">⏱️</span>
            <span className={styles.text.secondary}>8-10 Minuten</span>
          </div>
          <div className={`w-px h-8 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className="text-center">
            <span className="text-2xl block mb-1">🎯</span>
            <span className={styles.text.secondary}>10 Szenarien</span>
          </div>
          <div className={`w-px h-8 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className="text-center">
            <span className="text-2xl block mb-1">📊</span>
            <span className={styles.text.secondary}>Sofort Ergebnis</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onContinue}
        className={`${styles.button.primary} px-8 py-4 rounded-xl font-semibold 
                   text-lg transition-all duration-200 flex items-center gap-2 mx-auto`}
      >
        Jetzt starten
        <ArrowRightIcon />
      </button>
      
      <p className={`mt-6 text-sm ${styles.text.muted}`}>
        Wissenschaftlich fundiert · 100% kostenlos · Keine Registrierung nötig
      </p>
    </div>
  );
};

// Name Input Screen
const NameScreen: React.FC<{ 
  theme: Theme; 
  onContinue: (name: string) => void;
}> = ({ theme, onContinue }) => {
  const [name, setName] = useState('');
  const styles = getThemeStyles(theme);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onContinue(name.trim());
    }
  };
  
  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <span className="text-4xl mb-4 block">👋</span>
        <h2 className={`text-2xl font-bold ${styles.text.primary}`}>
          Wie heißt du?
        </h2>
        <p className={`mt-2 ${styles.text.secondary}`}>
          Dein Vorname hilft uns, die Analyse persönlicher zu gestalten.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dein Vorname"
          className={`w-full px-6 py-4 rounded-xl text-lg border-2 
                     transition-all duration-200 ${styles.input}`}
          autoFocus
        />
        
        <button
          type="submit"
          disabled={!name.trim()}
          className={`w-full mt-4 ${styles.button.primary} px-8 py-4 rounded-xl 
                     font-semibold text-lg transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2`}
        >
          Weiter
          <ArrowRightIcon />
        </button>
      </form>
    </div>
  );
};

// Email Input Screen
const EmailScreen: React.FC<{ 
  theme: Theme; 
  userName: string;
  onContinue: (email: string) => void;
  onSkip: () => void;
}> = ({ theme, userName, onContinue, onSkip }) => {
  const [email, setEmail] = useState('');
  const styles = getThemeStyles(theme);
  
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidEmail(email)) {
      onContinue(email);
    }
  };
  
  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <span className="text-4xl mb-4 block">📧</span>
        <h2 className={`text-2xl font-bold ${styles.text.primary}`}>
          Hallo {userName}! Deine E-Mail?
        </h2>
        <p className={`mt-2 ${styles.text.secondary}`}>
          Optional: Erhalte deine Ergebnisse auch per E-Mail.
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          className={`w-full px-6 py-4 rounded-xl text-lg border-2 
                     transition-all duration-200 ${styles.input}`}
          autoFocus
        />
        
        <button
          type="submit"
          disabled={!isValidEmail(email)}
          className={`w-full mt-4 ${styles.button.primary} px-8 py-4 rounded-xl 
                     font-semibold text-lg transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2`}
        >
          Weiter
          <ArrowRightIcon />
        </button>
        
        <button
          type="button"
          onClick={onSkip}
          className={`w-full mt-3 ${styles.button.secondary} px-8 py-3 rounded-xl 
                     font-medium transition-all duration-200`}
        >
          Überspringen
        </button>
      </form>
    </div>
  );
};

// Business Category Selection (Ansatz 2 - Step 1)
const BusinessCategoryScreen: React.FC<{
  theme: Theme;
  userName: string;
  onSelect: (category: CategoryOption) => void;
}> = ({ theme, userName, onSelect }) => {
  const styles = getThemeStyles(theme);
  
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <span className="text-4xl mb-4 block">💡</span>
        <h2 className={`text-2xl font-bold ${styles.text.primary}`}>
          In welchem Bereich startest du, {userName}?
        </h2>
        <p className={`mt-2 ${styles.text.secondary}`}>
          Wähle die Kategorie, die am besten passt.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BUSINESS_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category)}
            className={`${styles.button.option} p-4 rounded-xl border-2 
                       transition-all duration-200 text-left group
                       hover:scale-[1.02] active:scale-[0.98]`}
          >
            <span className="text-3xl mb-2 block group-hover:scale-110 transition-transform">
              {category.emoji}
            </span>
            <span className={`font-medium block ${styles.text.primary}`}>
              {category.label}
            </span>
            <span className={`text-xs ${styles.text.muted} line-clamp-2`}>
              {category.hint}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Smart Defaults Confirmation (Ansatz 2 - Step 2)
const SmartDefaultsScreen: React.FC<{
  theme: Theme;
  category: CategoryOption;
  defaults: SmartDefault;
  onConfirm: () => void;
  onCustomize: () => void;
}> = ({ theme, category, defaults, onConfirm, onCustomize }) => {
  const styles = getThemeStyles(theme);
  
  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <span className="text-4xl mb-4 block">{category.emoji}</span>
        <h2 className={`text-2xl font-bold ${styles.text.primary}`}>
          {category.label}
        </h2>
        <p className={`mt-2 ${styles.text.secondary}`}>
          Basierend auf deiner Wahl haben wir typische Werte eingetragen:
        </p>
      </div>
      
      <div className={`${styles.card} rounded-2xl p-6 border mb-6`}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={styles.text.secondary}>Zielgruppe:</span>
            <span className={`font-medium ${styles.text.primary}`}>
              {defaults.customerLabel}
            </span>
          </div>
          <div className={`h-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`} />
          <div className="flex justify-between items-center">
            <span className={styles.text.secondary}>Stadium:</span>
            <span className={`font-medium ${styles.text.primary}`}>
              {defaults.stageLabel}
            </span>
          </div>
        </div>
        
        <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 text-sm">
            <SparkleIcon />
            <span className={styles.text.muted}>{defaults.insight}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onConfirm}
          className={`w-full ${styles.button.primary} px-8 py-4 rounded-xl 
                     font-semibold text-lg transition-all duration-200
                     flex items-center justify-center gap-2`}
        >
          <CheckIcon />
          Stimmt so! Weiter
        </button>
        
        <button
          onClick={onCustomize}
          className={`w-full ${styles.button.secondary} px-8 py-3 rounded-xl 
                     font-medium transition-all duration-200
                     flex items-center justify-center gap-2`}
        >
          <EditIcon />
          Anpassen
        </button>
      </div>
      
      <p className={`mt-4 text-center text-sm ${styles.text.muted}`}>
        Du kannst dies später im Workshop verfeinern.
      </p>
    </div>
  );
};

// Custom Business Context Screen (Ansatz 2 - Optional Step 3)
const CustomizeBusinessScreen: React.FC<{
  theme: Theme;
  category: CategoryOption;
  defaults: SmartDefault;
  onComplete: (customer: string, customerLabel: string, stage: string, stageLabel: string) => void;
  onBack: () => void;
}> = ({ theme, category, defaults, onComplete, onBack }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(defaults.customer);
  const [selectedStage, setSelectedStage] = useState(defaults.stage);
  const styles = getThemeStyles(theme);
  
  const handleSubmit = () => {
    const customer = CUSTOMER_OPTIONS.find(c => c.id === selectedCustomer);
    const stage = STAGE_OPTIONS.find(s => s.id === selectedStage);
    if (customer && stage) {
      onComplete(customer.id, customer.label, stage.id, stage.label);
    }
  };
  
  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold ${styles.text.primary}`}>
          Anpassen
        </h2>
        <p className={`mt-2 ${styles.text.secondary}`}>
          {category.emoji} {category.label}
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className={`block mb-3 font-medium ${styles.text.primary}`}>
            Deine Zielgruppe:
          </label>
          <div className="space-y-2">
            {CUSTOMER_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedCustomer(option.id)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200
                  flex items-center gap-3
                  ${selectedCustomer === option.id 
                    ? styles.button.optionSelected 
                    : styles.button.option}`}
              >
                <span className="text-xl">{option.emoji}</span>
                <span className={styles.text.primary}>{option.label}</span>
                {selectedCustomer === option.id && (
                  <span className="ml-auto text-emerald-500"><CheckIcon /></span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Stage Selection */}
        <div>
          <label className={`block mb-3 font-medium ${styles.text.primary}`}>
            Dein Stadium:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STAGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedStage(option.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-200
                  ${selectedStage === option.id 
                    ? styles.button.optionSelected 
                    : styles.button.option}`}
              >
                <span className="text-xl block mb-1">{option.emoji}</span>
                <span className={`text-sm ${styles.text.primary}`}>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 space-y-3">
        <button
          onClick={handleSubmit}
          className={`w-full ${styles.button.primary} px-8 py-4 rounded-xl 
                     font-semibold text-lg transition-all duration-200
                     flex items-center justify-center gap-2`}
        >
          Weiter zur Analyse
          <ArrowRightIcon />
        </button>
        
        <button
          onClick={onBack}
          className={`w-full ${styles.button.secondary} px-8 py-3 rounded-xl 
                     font-medium transition-all duration-200`}
        >
          Zurück
        </button>
      </div>
    </div>
  );
};

// Scenario Assessment Screen
const ScenarioScreen: React.FC<{
  theme: Theme;
  scenario: Scenario;
  progress: Progress;
  onAnswer: (optionId: string) => void;
  isLoading: boolean;
}> = ({ theme, scenario, progress, onAnswer, isLoading }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const styles = getThemeStyles(theme);
  
  const handleSelect = (optionId: string) => {
    if (isLoading) return;
    setSelectedOption(optionId);
    
    // Small delay for visual feedback
    setTimeout(() => {
      onAnswer(optionId);
      setSelectedOption(null);
    }, 300);
  };
  
  // Option labels for A, B, C, D
  const optionLabels = ['A', 'B', 'C', 'D'];
  
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <ProgressBar progress={progress} theme={theme} />
      
      {/* Scenario Card */}
      <div className={`${styles.card} rounded-2xl p-6 md:p-8 border mb-6`}>
        {/* Situation */}
        <div className={`mb-6 pb-6 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
          <p className={`text-lg leading-relaxed ${styles.text.primary}`}>
            {scenario.situation}
          </p>
        </div>
        
        {/* Question */}
        <h3 className={`text-xl font-semibold mb-6 ${styles.text.primary}`}>
          {scenario.question}
        </h3>
        
        {/* Options */}
        <div className="space-y-3">
          {scenario.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={isLoading}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                flex items-start gap-4 group
                ${selectedOption === option.id 
                  ? 'bg-emerald-500/20 border-emerald-500 scale-[0.98]' 
                  : `${styles.button.option} hover:scale-[1.01]`}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {/* Option Label (A, B, C, D) */}
              <span className={`
                w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                transition-colors duration-200 shrink-0
                ${selectedOption === option.id 
                  ? 'bg-emerald-500 text-white' 
                  : theme === 'dark' 
                    ? 'bg-slate-600 text-slate-300 group-hover:bg-emerald-500/20' 
                    : 'bg-slate-200 text-slate-600 group-hover:bg-emerald-500/20'}
              `}>
                {optionLabels[index]}
              </span>
              
              {/* Option Text */}
              <span className={`flex-1 ${styles.text.primary}`}>
                {option.text}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Hint */}
      <p className={`text-center text-sm ${styles.text.muted}`}>
        Es gibt keine richtigen oder falschen Antworten. Wähle, was am besten zu dir passt.
      </p>
    </div>
  );
};

// Loading Screen
const LoadingScreen: React.FC<{ theme: Theme; message: string }> = ({ theme, message }) => {
  const styles = getThemeStyles(theme);
  
  return (
    <div className="text-center animate-fade-in">
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
      </div>
      <p className={`text-lg ${styles.text.secondary}`}>{message}</p>
    </div>
  );
};

// Simple Results Display (placeholder - integrate with full ResultsPage)
const SimpleResultsScreen: React.FC<{
  theme: Theme;
  results: AssessmentResults;
  userName: string;
}> = ({ theme, results, userName }) => {
  const styles = getThemeStyles(theme);
  const profile = results.personality_profile;
  
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <span className="text-6xl mb-4 block">🎉</span>
        <h1 className={`text-3xl font-bold ${styles.text.primary}`}>
          {userName}, dein Gründer-Profil!
        </h1>
      </div>
      
      {/* Archetype Card */}
      <div className={`${styles.card} rounded-2xl p-8 border mb-6 text-center`}>
        <h2 className="text-2xl font-bold text-emerald-500 mb-2">
          {profile.archetype_name}
        </h2>
        <p className={`text-lg italic ${styles.text.secondary} mb-4`}>
          "{profile.tagline}"
        </p>
        <p className={styles.text.primary}>
          {profile.description}
        </p>
        
        {/* Success Prediction */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-center justify-center gap-4">
            <span className={styles.text.secondary}>GZ-Erfolgswahrscheinlichkeit:</span>
            <span className="text-2xl font-bold text-emerald-500">
              {profile.gz_success_prediction}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Strengths & Challenges */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className={`${styles.card} rounded-xl p-6 border`}>
          <h3 className="font-semibold text-emerald-500 mb-3">✅ Deine Stärken</h3>
          <ul className="space-y-2">
            {profile.primary_strengths.slice(0, 3).map((strength, i) => (
              <li key={i} className={`text-sm ${styles.text.primary}`}>• {strength}</li>
            ))}
          </ul>
        </div>
        
        <div className={`${styles.card} rounded-xl p-6 border`}>
          <h3 className="font-semibold text-amber-500 mb-3">⚠️ Zu beachten</h3>
          <ul className="space-y-2">
            {profile.primary_challenges.slice(0, 3).map((challenge, i) => (
              <li key={i} className={`text-sm ${styles.text.primary}`}>• {challenge}</li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* CTA */}
      <div className="text-center">
        <button className={`${styles.button.primary} px-8 py-4 rounded-xl font-semibold text-lg`}>
          Zum kostenlosen Workshop →
        </button>
        <p className={`mt-4 text-sm ${styles.text.muted}`}>
          Module 1 hilft dir, deine Stärken optimal für den GZ-Antrag zu nutzen.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const GruenderAIAssessment: React.FC = () => {
  // Theme
  const [theme, setTheme] = useState<Theme>('dark');
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  
  // Flow State
  const [stage, setStage] = useState<Stage>('welcome');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [_businessContext, setBusinessContext] = useState<BusinessContext | null>(null);
  
  // Assessment State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [progress, setProgress] = useState<Progress>({
    current_item: 0,
    estimated_total: 10,
    percentage: 0,
    dimensions_assessed: 0,
    total_dimensions: 7,
  });
  const [results, setResults] = useState<AssessmentResults | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMicroInsight, setShowMicroInsight] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<MicroInsight | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  
  const styles = getThemeStyles(theme);
  
  // Start Assessment Session
  const startAssessmentSession = useCallback(async (context: BusinessContext) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Map frontend context to backend format
      const backendContext = {
        business_type: context.category,
        target_customer: context.targetCustomer,
        stage: context.stage,
      };
      
      const response = await apiCall('/api/v1/assessment/start', 'POST', {
        user_id: userEmail || undefined,
        business_context: backendContext,
      });
      
      if (response.session_id) {
        setSessionId(response.session_id);
      }
      
      if (response.scenario) {
        setCurrentScenario(response.scenario);
      }
      
      if (response.progress) {
        setProgress(response.progress);
      }
      
      setStage('scenarios');
    } catch (err) {
      console.error('Failed to start assessment:', err);
      setError('Verbindungsfehler. Bitte versuche es erneut.');
      
      // Fallback: Use mock data for demo
      setCurrentScenario({
        scenario_id: 'DEMO_001',
        situation: `Dein ${context.categoryLabel} startet in einem Markt mit etablierten Wettbewerbern. Du musst dein Angebot positionieren.`,
        question: 'Wie gehst du vor?',
        options: [
          { id: 'A', text: 'Ich kopiere das bewährte Konzept der Marktführer - warum das Rad neu erfinden?' },
          { id: 'B', text: 'Ich mache das Gleiche, aber günstiger - Preis schlägt alles.' },
          { id: 'C', text: 'Ich kombiniere bewährte Elemente neu und füge eigene Ideen hinzu.' },
          { id: 'D', text: 'Ich entwickle etwas völlig Neues - echte Innovation oder nichts!' },
        ],
      });
      setProgress({ current_item: 1, estimated_total: 10, percentage: 10, dimensions_assessed: 0, total_dimensions: 7 });
      setStage('scenarios');
    } finally {
      setIsLoading(false);
    }
  }, [userEmail]);
  
  // Submit Scenario Answer
  const submitAnswer = useCallback(async (optionId: string) => {
    if (!currentScenario) return;
    
    setIsLoading(true);
    setQuestionsAnswered(prev => prev + 1);
    
    try {
      const response = await apiCall(`/api/v1/assessment/${sessionId}/respond`, 'POST', {
        scenario_id: currentScenario.scenario_id,
        selected_option: optionId,
        response_time_ms: 5000, // Could track actual time
      });
      
      // Show micro-insight every 3rd question
      if ((questionsAnswered + 1) % 3 === 0 && !response.complete) {
        const insightIndex = Math.floor((questionsAnswered + 1) / 3) - 1;
        const insight = MICRO_INSIGHTS[insightIndex % MICRO_INSIGHTS.length];
        setCurrentInsight(insight);
        setShowMicroInsight(true);
      }
      
      if (response.complete && response.results) {
        setResults(response.results);
        setStage('results');
      } else if (response.scenario) {
        setCurrentScenario(response.scenario);
        if (response.progress) {
          setProgress(response.progress);
        }
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      
      // Fallback: Simulate progress for demo
      const newProgress = {
        ...progress,
        current_item: progress.current_item + 1,
        percentage: Math.min(100, progress.percentage + 10),
      };
      setProgress(newProgress);
      
      if (newProgress.percentage >= 100) {
        // Mock results
        setResults({
          personality_profile: {
            archetype_id: 'innovator',
            archetype_name: 'Der Visionäre Innovator',
            tagline: 'Zukunft gestalten, nicht verwalten',
            description: 'Du denkst in Möglichkeiten, nicht in Grenzen. Deine Stärke liegt darin, neue Wege zu finden wo andere nur Sackgassen sehen.',
            primary_strengths: ['Kreatives Denken', 'Risikobereitschaft', 'Zukunftsorientierung'],
            primary_challenges: ['Detailarbeit kann ungeduldig machen', 'Manchmal zu viele Ideen gleichzeitig'],
            gz_success_prediction: 78,
          },
          dimension_scores: {},
          gap_analysis: { priority_gaps: [], overall_readiness: 75 },
          radar_chart_data: [],
        });
        setStage('results');
      } else {
        // Generate next demo scenario
        const scenarios = [
          {
            scenario_id: `DEMO_${progress.current_item + 1}`,
            situation: 'Ein wichtiger Kunde beschwert sich öffentlich über deine Dienstleistung. Die Kritik ist teilweise berechtigt.',
            question: 'Wie reagierst du?',
            options: [
              { id: 'A', text: 'Ich ignoriere es - nicht jeder Kunde ist zufriedenstellbar.' },
              { id: 'B', text: 'Ich antworte defensiv und erkläre meine Sicht der Dinge.' },
              { id: 'C', text: 'Ich entschuldige mich öffentlich und biete eine Lösung an.' },
              { id: 'D', text: 'Ich kontaktiere den Kunden privat, um das Problem zu verstehen.' },
            ],
          },
          {
            scenario_id: `DEMO_${progress.current_item + 1}`,
            situation: 'Du hast die Möglichkeit, einen großen Auftrag anzunehmen, aber er würde deine Kapazitäten stark belasten.',
            question: 'Was tust du?',
            options: [
              { id: 'A', text: 'Ablehnen - Qualität geht vor Quantität.' },
              { id: 'B', text: 'Annehmen und hoffen, dass es klappt.' },
              { id: 'C', text: 'Annehmen mit klaren Bedingungen und Timeline.' },
              { id: 'D', text: 'Teilweise annehmen und den Rest an Partner delegieren.' },
            ],
          },
        ];
        setCurrentScenario(scenarios[progress.current_item % scenarios.length]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentScenario, sessionId, questionsAnswered, progress]);
  
  // Handle Business Context Confirmation (Smart Defaults)
  const handleBusinessConfirm = useCallback(() => {
    if (!selectedCategory) return;
    
    const defaults = SMART_DEFAULTS[selectedCategory.id];
    const context: BusinessContext = {
      category: selectedCategory.id,
      categoryLabel: selectedCategory.label,
      targetCustomer: defaults.customer,
      targetCustomerLabel: defaults.customerLabel,
      stage: defaults.stage,
      stageLabel: defaults.stageLabel,
      usedDefaults: true,
    };
    
    setBusinessContext(context);
    startAssessmentSession(context);
  }, [selectedCategory, startAssessmentSession]);
  
  // Handle Custom Business Context
  const handleBusinessCustomize = useCallback((customer: string, customerLabel: string, stage: string, stageLabel: string) => {
    if (!selectedCategory) return;
    
    const context: BusinessContext = {
      category: selectedCategory.id,
      categoryLabel: selectedCategory.label,
      targetCustomer: customer,
      targetCustomerLabel: customerLabel,
      stage: stage,
      stageLabel: stageLabel,
      usedDefaults: false,
    };
    
    setBusinessContext(context);
    startAssessmentSession(context);
  }, [selectedCategory, startAssessmentSession]);
  
  // Render current stage
  const renderStage = () => {
    switch (stage) {
      case 'welcome':
        return <WelcomeScreen theme={theme} onContinue={() => setStage('name')} />;
      
      case 'name':
        return (
          <NameScreen 
            theme={theme} 
            onContinue={(name) => {
              setUserName(name);
              setStage('email');
            }} 
          />
        );
      
      case 'email':
        return (
          <EmailScreen 
            theme={theme}
            userName={userName}
            onContinue={(email) => {
              setUserEmail(email);
              setStage('business_category');
            }}
            onSkip={() => setStage('business_category')}
          />
        );
      
      case 'business_category':
        return (
          <BusinessCategoryScreen
            theme={theme}
            userName={userName}
            onSelect={(category) => {
              setSelectedCategory(category);
              setStage('business_defaults');
            }}
          />
        );
      
      case 'business_defaults':
        if (!selectedCategory) return null;
        return (
          <SmartDefaultsScreen
            theme={theme}
            category={selectedCategory}
            defaults={SMART_DEFAULTS[selectedCategory.id]}
            onConfirm={handleBusinessConfirm}
            onCustomize={() => setStage('business_customize')}
          />
        );
      
      case 'business_customize':
        if (!selectedCategory) return null;
        return (
          <CustomizeBusinessScreen
            theme={theme}
            category={selectedCategory}
            defaults={SMART_DEFAULTS[selectedCategory.id]}
            onComplete={handleBusinessCustomize}
            onBack={() => setStage('business_defaults')}
          />
        );
      
      case 'scenarios':
        if (isLoading && !currentScenario) {
          return <LoadingScreen theme={theme} message="Bereite deine personalisierte Analyse vor..." />;
        }
        if (!currentScenario) {
          return <LoadingScreen theme={theme} message="Lade Szenario..." />;
        }
        return (
          <ScenarioScreen
            theme={theme}
            scenario={currentScenario}
            progress={progress}
            onAnswer={submitAnswer}
            isLoading={isLoading}
          />
        );
      
      case 'results':
        if (!results) {
          return <LoadingScreen theme={theme} message="Erstelle dein Profil..." />;
        }
        return (
          <SimpleResultsScreen
            theme={theme}
            results={results}
            userName={userName}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`min-h-screen ${styles.container} transition-colors duration-300`}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        
        {/* Micro Insight Overlay */}
        {showMicroInsight && currentInsight && (
          <MicroInsightCard
            insight={currentInsight}
            theme={theme}
            onDismiss={() => setShowMicroInsight(false)}
          />
        )}
        
        {/* Main Content */}
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-4xl">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-center">
                {error}
              </div>
            )}
            
            {renderStage()}
          </div>
        </div>
        
        {/* Custom CSS for animations */}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slide-down {
            from { opacity: 0; transform: translate(-50%, -20px); }
            to { opacity: 1; transform: translate(-50%, 0); }
          }
          
          .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
          }
          
          .animate-slide-down {
            animation: slide-down 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
};

export default GruenderAIAssessment;
