/**
 * GründerAI Assessment Components - Dark Theme
 * Matches the Results Page design language
 * 
 * Components:
 * - AssessmentQuestion: Single question display with response options
 * - AssessmentProgress: Progress bar and insights
 * - AssessmentHeader: Consistent header across all stages
 */

import React, { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface Question {
  id: string;
  text_de: string;
  dimension: string;
  response_scale: Record<number, string>;
}

interface Progress {
  items_completed: number;
  estimated_remaining: number;
  percentage: number;
}

// ============================================================================
// ICONS
// ============================================================================

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<{ children: React.ReactNode; className?: string; size?: number; style?: React.CSSProperties }> = ({ 
  children, className = "", size = 20, style 
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>{children}</svg>
);

const Rocket: React.FC<IconProps> = (p) => <Icon {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></Icon>;
const Brain: React.FC<IconProps> = (p) => <Icon {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></Icon>;
const Sparkles: React.FC<IconProps> = (p) => <Icon {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></Icon>;
const Lightbulb: React.FC<IconProps> = (p) => <Icon {...p}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></Icon>;
const Clock: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const Shield: React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const CheckCircle: React.FC<IconProps> = (p) => <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>;
const ArrowRight: React.FC<IconProps> = (p) => <Icon {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></Icon>;
const User: React.FC<IconProps> = (p) => <Icon {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
const Mail: React.FC<IconProps> = (p) => <Icon {...p}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></Icon>;


// ============================================================================
// SHARED HEADER COMPONENT
// ============================================================================

interface AssessmentHeaderProps {
  stage?: string;
}

export const AssessmentHeader: React.FC<AssessmentHeaderProps> = ({ stage }) => (
  <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
          <Rocket size={18} className="text-white" />
        </div>
        <span className="font-bold text-white">GründerAI</span>
      </div>
      {stage && (
        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">{stage}</span>
      )}
    </div>
  </header>
);

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

interface AssessmentProgressProps {
  progress: Progress;
  insights?: string[];
  userName?: string;
  userEmail?: string;
}

export const AssessmentProgress: React.FC<AssessmentProgressProps> = ({ 
  progress, 
  insights = [],
  userName,
  userEmail 
}) => (
  <div className="space-y-4">
    {/* User Badge */}
    {userName && (
      <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{userName}</p>
          {userEmail && <p className="text-xs text-slate-400">{userEmail}</p>}
        </div>
      </div>
    )}

    {/* Progress Bar */}
    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-400">Fortschritt</span>
        <span className="text-amber-400 font-semibold">{progress.percentage}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${progress.percentage}%`,
            background: 'linear-gradient(90deg, #f59e0b 0%, #eab308 100%)'
          }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Noch ca. {progress.estimated_remaining} Fragen · {progress.items_completed} beantwortet
      </p>
    </div>

    {/* Insights */}
    {insights.length > 0 && (
      <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/30">
        <h3 className="font-medium text-emerald-400 mb-2 flex items-center gap-2">
          <Lightbulb size={16} />
          Deine Stärken:
        </h3>
        <ul className="text-sm text-emerald-300 space-y-1">
          {insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// ============================================================================
// QUESTION COMPONENT
// ============================================================================

interface AssessmentQuestionProps {
  question: Question;
  onRespond: (value: number) => void;
  isLoading?: boolean;
  progress: Progress;
  insights?: string[];
  userName?: string;
  userEmail?: string;
  error?: string | null;
}

export const AssessmentQuestion: React.FC<AssessmentQuestionProps> = ({
  question,
  onRespond,
  isLoading = false,
  progress,
  insights = [],
  userName,
  userEmail,
  error
}) => {
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  // Get dimension display name
  const getDimensionName = (dimension: string): string => {
    const names: Record<string, string> = {
      innovativeness: 'Innovationsfreude',
      risk_taking: 'Risikobereitschaft',
      achievement_orientation: 'Leistungsorientierung',
      autonomy_orientation: 'Autonomiestreben',
      proactiveness: 'Proaktivität',
      locus_of_control: 'Kontrollüberzeugung',
      self_efficacy: 'Selbstwirksamkeit'
    };
    return names[dimension] || dimension;
  };

  // Get dimension color
  const getDimensionColor = (dimension: string): string => {
    const colors: Record<string, string> = {
      innovativeness: '#8b5cf6',
      risk_taking: '#f59e0b',
      achievement_orientation: '#10b981',
      autonomy_orientation: '#3b82f6',
      proactiveness: '#ec4899',
      locus_of_control: '#06b6d4',
      self_efficacy: '#84cc16'
    };
    return colors[dimension] || '#8b5cf6';
  };

  const dimensionColor = getDimensionColor(question.dimension);

  return (
    <div className="min-h-screen bg-slate-900">
      <AssessmentHeader stage="Persönlichkeitsanalyse" />
      
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Progress & Insights */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <AssessmentProgress 
              progress={progress}
              insights={insights}
              userName={userName}
              userEmail={userEmail}
            />
          </div>

          {/* Right: Question */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6">
              {/* Dimension Badge */}
              <div className="mb-4">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${dimensionColor}20`,
                    color: dimensionColor
                  }}
                >
                  <Brain size={14} />
                  {getDimensionName(question.dimension)}
                </span>
              </div>

              {/* Question Text */}
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-6 leading-relaxed">
                {question.text_de}
              </h2>

              {/* Response Options */}
              <div className="space-y-3">
                {Object.entries(question.response_scale).map(([value, label]) => {
                  const numValue = parseInt(value);
                  const isHovered = hoveredOption === numValue;
                  
                  return (
                    <button
                      key={value}
                      onClick={() => onRespond(numValue)}
                      onMouseEnter={() => setHoveredOption(numValue)}
                      onMouseLeave={() => setHoveredOption(null)}
                      disabled={isLoading}
                      className={`
                        w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${isHovered 
                          ? 'border-amber-500 bg-amber-500/10 scale-[1.02]' 
                          : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <span 
                          className={`
                            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
                            transition-colors duration-200
                            ${isHovered 
                              ? 'bg-amber-500 text-white' 
                              : 'bg-slate-700 text-slate-300'
                            }
                          `}
                        >
                          {value}
                        </span>
                        <span className={`text-base ${isHovered ? 'text-white' : 'text-slate-300'}`}>
                          {label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="mt-6 flex items-center justify-center gap-3 text-amber-400">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Wird verarbeitet...</span>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* Hint */}
            <p className="text-center text-slate-500 text-xs mt-4">
              Wähle die Antwort, die am besten zu dir passt. Es gibt keine falschen Antworten.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// WELCOME / INTRO COMPONENT
// ============================================================================

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div className="max-w-lg w-full">
      <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-8 text-center">
        {/* Logo Animation */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Rocket size={40} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Willkommen bei GründerAI
        </h1>
        
        <p className="text-slate-400 mb-6">
          Entdecke dein Gründerprofil und erhalte einen personalisierten Businessplan für deinen Gründungszuschuss.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Brain size={20} className="text-purple-400" />
            </div>
            <p className="text-xs text-slate-400">KI-Analyse</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock size={20} className="text-amber-400" />
            </div>
            <p className="text-xs text-slate-400">12-15 Min</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield size={20} className="text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">100% kostenlos</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2"
        >
          Jetzt starten
          <ArrowRight size={20} />
        </button>

        {/* Trust */}
        <p className="text-xs text-slate-500 mt-4">
          🔒 Deine Daten sind sicher · Keine Kreditkarte nötig
        </p>
      </div>
    </div>
  </div>
);

// ============================================================================
// NAME INPUT COMPONENT
// ============================================================================

interface NameInputProps {
  onSubmit: (name: string) => void;
}

export const NameInput: React.FC<NameInputProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (name.trim().length >= 2) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-8">
          {/* AI Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles size={28} className="text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                <CheckCircle size={12} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-white font-medium">Dein KI-Berater</p>
              <p className="text-xs text-slate-400">Online und bereit</p>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Hallo! Ich freue mich, dich kennenzulernen. 👋
          </h2>
          <p className="text-slate-400 mb-6">
            Wie darf ich dich nennen?
          </p>

          {/* Input */}
          <div className="relative mb-4">
            <div className={`
              absolute left-4 top-1/2 -translate-y-1/2 transition-colors
              ${isFocused ? 'text-amber-400' : 'text-slate-500'}
            `}>
              <User size={20} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Dein Vorname..."
              autoFocus
              className={`
                w-full py-4 pl-12 pr-4 bg-slate-800/50 border-2 rounded-xl text-white placeholder-slate-500
                outline-none transition-all
                ${isFocused ? 'border-amber-500' : 'border-slate-700'}
              `}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={name.trim().length < 2}
            className={`
              w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2
              ${name.trim().length >= 2
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:scale-105'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            Weiter
            <ArrowRight size={20} />
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Drücke Enter zum Fortfahren
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EMAIL INPUT COMPONENT
// ============================================================================

interface EmailInputProps {
  userName: string;
  onSubmit: (email: string) => void;
}

export const EmailInput: React.FC<EmailInputProps> = ({ userName, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validateEmail = (value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(re.test(value));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = () => {
    if (isValid) {
      onSubmit(email);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-8">
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          </div>

          {/* Question */}
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
            Freut mich, {userName}! 🎉
          </h2>
          <p className="text-slate-400 mb-6">
            Wohin darf ich deine Ergebnisse und deinen Businessplan senden?
          </p>

          {/* Input */}
          <div className="relative mb-4">
            <div className={`
              absolute left-4 top-1/2 -translate-y-1/2 transition-colors
              ${isFocused ? 'text-amber-400' : 'text-slate-500'}
            `}>
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="deine@email.de"
              autoFocus
              className={`
                w-full py-4 pl-12 pr-4 bg-slate-800/50 border-2 rounded-xl text-white placeholder-slate-500
                outline-none transition-all
                ${isFocused 
                  ? isValid ? 'border-emerald-500' : 'border-amber-500'
                  : 'border-slate-700'
                }
              `}
            />
            {email && isValid && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400">
                <CheckCircle size={20} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`
              w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2
              ${isValid
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:scale-105'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            Weiter
            <ArrowRight size={20} />
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-1">
            <Shield size={12} />
            Wir respektieren deine Privatsphäre. Kein Spam, versprochen.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BUSINESS TYPE SELECTOR
// ============================================================================

interface BusinessTypeSelectorProps {
  userName: string;
  onSelect: (type: string) => void;
}

const BUSINESS_TYPES = [
  { id: 'consulting', label: 'Beratung / Coaching', emoji: '💼', color: '#3b82f6' },
  { id: 'ecommerce', label: 'E-Commerce / Online-Shop', emoji: '🛒', color: '#10b981' },
  { id: 'service', label: 'Dienstleistung', emoji: '🛠️', color: '#f59e0b' },
  { id: 'tech', label: 'Tech / Software', emoji: '💻', color: '#8b5cf6' },
  { id: 'gastro', label: 'Gastronomie / Food', emoji: '🍽️', color: '#ec4899' },
  { id: 'creative', label: 'Kreativ / Design', emoji: '🎨', color: '#06b6d4' },
  { id: 'health', label: 'Gesundheit / Wellness', emoji: '💪', color: '#84cc16' },
  { id: 'other', label: 'Sonstiges', emoji: '✨', color: '#64748b' },
];

export const BusinessTypeSelector: React.FC<BusinessTypeSelectorProps> = ({ userName, onSelect }) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-8">
          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          </div>

          {/* Question */}
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">
            Super, {userName}! Was für ein Geschäft planst du?
          </h2>
          <p className="text-slate-400 mb-6 text-center">
            Das hilft uns, die Fragen auf dein Vorhaben anzupassen.
          </p>

          {/* Business Type Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BUSINESS_TYPES.map((type) => {
              const isHovered = hoveredType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => onSelect(type.id)}
                  onMouseEnter={() => setHoveredType(type.id)}
                  onMouseLeave={() => setHoveredType(null)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200 text-center
                    ${isHovered 
                      ? 'scale-105' 
                      : ''
                    }
                  `}
                  style={{
                    borderColor: isHovered ? type.color : 'rgb(51 65 85 / 0.5)',
                    backgroundColor: isHovered ? `${type.color}15` : 'rgb(30 41 59 / 0.3)'
                  }}
                >
                  <span className="text-3xl mb-2 block">{type.emoji}</span>
                  <span className={`text-sm ${isHovered ? 'text-white' : 'text-slate-300'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LOADING / TRANSITION SCREEN
// ============================================================================

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Wird geladen...",
  subMessage
}) => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 border-4 border-amber-400/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-white font-medium">{message}</p>
      {subMessage && <p className="text-slate-400 text-sm mt-1">{subMessage}</p>}
    </div>
  </div>
);

export default AssessmentQuestion;
