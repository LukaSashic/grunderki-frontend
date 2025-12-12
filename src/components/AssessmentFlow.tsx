/**
 * GründerAI Assessment Flow - Complete Dark Theme Version
 * With Light/Dark mode toggle
 * 
 * Flow: Welcome → Name → Email → Business Context → Assessment → Results
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { ResultsPage } from './ResultsPage';
import { BusinessContextCapture, BusinessContext as ImportedBusinessContext } from './BusinessContextCapture';

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

// Wrapper component to pass theme from context
const BusinessContextCaptureComponent: React.FC<{
  userName: string;
  onComplete: (context: ImportedBusinessContext) => void;
  theme: Theme;
}> = ({ userName, onComplete, theme }) => {
  return (
    <BusinessContextCapture 
      userName={userName} 
      onComplete={onComplete} 
      theme={theme}
    />
  );
};

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => { console.log('API Request:', config.method?.toUpperCase(), config.url); return config; },
  (error) => { console.error('Request Error:', error); return Promise.reject(error); }
);

api.interceptors.response.use(
  (response) => { console.log('API Response:', response.status, response.config.url); return response; },
  (error) => {
    if (error.response) console.error('Response Error:', error.response.status, error.response.data);
    else if (error.request) console.error('Network Error:', error.message);
    else console.error('Error:', error.message);
    return Promise.reject(error);
  }
);

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

interface AssessmentState {
  stage: 'welcome' | 'name' | 'email' | 'business_context' | 'assessment' | 'results';
  name: string;
  email: string;
  businessContext: BusinessContext | null;
  sessionId: string | null;
  currentQuestion: Question | null;
  progress: Progress;
  insights: string[];
  questionStartTime: number;
  results: any | null;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
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
const Sun: React.FC<IconProps> = (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></Icon>;
const Moon: React.FC<IconProps> = (p) => <Icon {...p}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></Icon>;
const MessageCircle: React.FC<IconProps> = (p) => <Icon {...p}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></Icon>;
const Send: React.FC<IconProps> = (p) => <Icon {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></Icon>;

// ============================================================================
// THEME TOGGLE COMPONENT
// ============================================================================

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-colors
        ${theme === 'dark' 
          ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
      `}
      title={theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface HeaderProps {
  stage?: string;
}

const Header: React.FC<HeaderProps> = ({ stage }) => {
  const { theme } = useTheme();
  
  return (
    <header className={`
      border-b sticky top-0 z-50 backdrop-blur-sm
      ${theme === 'dark' 
        ? 'border-slate-800 bg-slate-900/80' 
        : 'border-gray-200 bg-white/80'
      }
    `}>
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Rocket size={18} className="text-white" />
          </div>
          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            GründerAI
          </span>
        </div>
        <div className="flex items-center gap-3">
          {stage && (
            <span className={`
              text-xs px-3 py-1 rounded-full
              ${theme === 'dark' ? 'text-slate-400 bg-slate-800' : 'text-gray-500 bg-gray-100'}
            `}>
              {stage}
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// WELCOME SCREEN
// ============================================================================

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="max-w-lg w-full">
        <div className={`
          rounded-2xl p-8 text-center
          ${theme === 'dark' 
            ? 'bg-slate-800/40 border border-slate-700/50' 
            : 'bg-white shadow-xl'
          }
        `}>
          {/* Logo */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket size={40} className="text-white" />
            </div>
          </div>

          <h1 className={`text-2xl md:text-3xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Willkommen bei GründerAI
          </h1>
          
          <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            Entdecke dein Gründerprofil und erhalte einen personalisierten Businessplan für deinen Gründungszuschuss.
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <Brain size={20} style={{ color: '#a855f7' }} />
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>KI-Analyse</p>
            </div>
            <div className="text-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                <Clock size={20} style={{ color: '#f59e0b' }} />
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>12-15 Min</p>
            </div>
            <div className="text-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                <Shield size={20} style={{ color: '#10b981' }} />
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Kostenlos</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onStart}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg"
          >
            Jetzt starten
            <ArrowRight size={20} />
          </button>

          <p className={`text-xs mt-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            🔒 Deine Daten sind sicher · Keine Kreditkarte nötig
          </p>
        </div>
        
        {/* Theme Toggle in corner */}
        <div className="flex justify-center mt-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NAME INPUT
// ============================================================================

interface NameInputProps {
  onSubmit: (name: string) => void;
}

const NameInput: React.FC<NameInputProps> = ({ onSubmit }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (name.trim().length >= 2) onSubmit(name.trim());
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Header />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-60px)]">
        <div className="max-w-lg w-full">
          <div className={`
            rounded-2xl p-8
            ${theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/50' : 'bg-white shadow-xl'}
          `}>
            {/* AI Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles size={28} className="text-white" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 flex items-center justify-center ${theme === 'dark' ? 'border-slate-800' : 'border-white'}`}>
                  <CheckCircle size={12} className="text-white" />
                </div>
              </div>
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dein KI-Berater</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Online und bereit</p>
              </div>
            </div>

            <h2 className={`text-xl md:text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Hallo! Ich freue mich, dich kennenzulernen. 👋
            </h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              Wie darf ich dich nennen?
            </p>

            {/* Input */}
            <div className="relative mb-4">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-amber-400' : theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
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
                  w-full py-4 pl-12 pr-4 border-2 rounded-xl outline-none transition-all
                  ${theme === 'dark' 
                    ? 'bg-slate-800/50 text-white placeholder-slate-500' 
                    : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                  }
                  ${isFocused 
                    ? 'border-amber-500' 
                    : theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
                  }
                `}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={name.trim().length < 2}
              className={`
                w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                ${name.trim().length >= 2
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:scale-105'
                  : theme === 'dark' ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Weiter <ArrowRight size={20} />
            </button>

            <p className={`text-xs text-center mt-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
              Drücke Enter zum Fortfahren
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EMAIL INPUT
// ============================================================================

interface EmailInputProps {
  userName: string;
  onSubmit: (email: string) => void;
}

const EmailInput: React.FC<EmailInputProps> = ({ userName, onSubmit }) => {
  const { theme } = useTheme();
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
    if (isValid) onSubmit(email);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Header />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-60px)]">
        <div className="max-w-lg w-full">
          <div className={`
            rounded-2xl p-8
            ${theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/50' : 'bg-white shadow-xl'}
          `}>
            {/* Progress Dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className={`w-2.5 h-2.5 rounded-full ${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`} />
              <div className={`w-2.5 h-2.5 rounded-full ${theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'}`} />
            </div>

            <h2 className={`text-xl md:text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Freut mich, {userName}! 🎉
            </h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              Wohin darf ich deine Ergebnisse senden?
            </p>

            <div className="relative mb-4">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isFocused ? 'text-amber-400' : theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
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
                  w-full py-4 pl-12 pr-12 border-2 rounded-xl outline-none transition-all
                  ${theme === 'dark' 
                    ? 'bg-slate-800/50 text-white placeholder-slate-500' 
                    : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                  }
                  ${isFocused 
                    ? isValid ? 'border-emerald-500' : 'border-amber-500'
                    : theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
                  }
                `}
              />
              {email && isValid && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400">
                  <CheckCircle size={20} />
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isValid}
              className={`
                w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                ${isValid
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:scale-105'
                  : theme === 'dark' ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Weiter <ArrowRight size={20} />
            </button>

            <p className={`text-xs text-center mt-4 flex items-center justify-center gap-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
              <Shield size={12} /> Kein Spam, versprochen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BUSINESS CONTEXT TYPE (for hybrid capture)
// ============================================================================

interface BusinessContext {
  category: string;
  categoryLabel: string;
  targetCustomer: string;
  targetCustomerLabel: string;
  stage: string;
  stageLabel: string;
  specificNiche: string;
  problemStatement: string;
  uniqueValue: string;
  completedAt: string;
  confidence: number;
}

// ============================================================================
// ASSESSMENT QUESTION COMPONENT
// ============================================================================

interface AssessmentQuestionProps {
  question: Question;
  onRespond: (value: number) => void;
  isLoading: boolean;
  progress: Progress;
  insights: string[];
  userName: string;
  userEmail: string;
  error: string | null;
}

const AssessmentQuestionComponent: React.FC<AssessmentQuestionProps> = ({
  question, onRespond, isLoading, progress, insights, userName, userEmail, error
}) => {
  const { theme } = useTheme();
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  const getDimensionName = (d: string): string => {
    const names: Record<string, string> = {
      innovativeness: 'Innovationsfreude', risk_taking: 'Risikobereitschaft',
      achievement_orientation: 'Leistungsorientierung', autonomy_orientation: 'Autonomiestreben',
      proactiveness: 'Proaktivität', locus_of_control: 'Kontrollüberzeugung', self_efficacy: 'Selbstwirksamkeit'
    };
    return names[d] || d;
  };

  const getDimensionColor = (d: string): string => {
    const colors: Record<string, string> = {
      innovativeness: '#8b5cf6', risk_taking: '#f59e0b', achievement_orientation: '#10b981',
      autonomy_orientation: '#3b82f6', proactiveness: '#ec4899', locus_of_control: '#06b6d4', self_efficacy: '#84cc16'
    };
    return colors[d] || '#8b5cf6';
  };

  const dimensionColor = getDimensionColor(question.dimension);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <Header stage="Persönlichkeitsanalyse" />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Progress */}
          <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
            {/* User Badge */}
            <div className={`flex items-center gap-3 rounded-xl p-3 ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-white shadow'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{userName}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{userEmail}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-slate-800/30 border border-slate-700/50' : 'bg-white shadow'}`}>
              <div className="flex justify-between text-sm mb-2">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}>Fortschritt</span>
                <span className="text-amber-500 font-semibold">{progress.percentage}%</span>
              </div>
              <div className={`w-full rounded-full h-2.5 overflow-hidden ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress.percentage}%`, background: 'linear-gradient(90deg, #f59e0b, #eab308)' }}
                />
              </div>
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
                Noch ca. {progress.estimated_remaining} Fragen
              </p>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                <h3 className="font-medium text-emerald-500 mb-2 flex items-center gap-2">
                  <Lightbulb size={16} /> Deine Stärken:
                </h3>
                <ul className={`text-sm space-y-1 ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>
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

          {/* Right: Question */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/50' : 'bg-white shadow-lg'}`}>
              {/* Dimension Badge */}
              <div className="mb-4">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${dimensionColor}20`, color: dimensionColor }}
                >
                  <Brain size={14} />
                  {getDimensionName(question.dimension)}
                </span>
              </div>

              {/* Question Text */}
              <h2 className={`text-xl md:text-2xl font-semibold mb-6 leading-relaxed ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                          ? 'border-amber-500 scale-[1.02]' 
                          : theme === 'dark' ? 'border-slate-700 hover:border-slate-600' : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      style={{ backgroundColor: isHovered ? 'rgba(245, 158, 11, 0.1)' : theme === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'white' }}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`
                          flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors
                          ${isHovered ? 'bg-amber-500 text-white' : theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}
                        `}>
                          {value}
                        </span>
                        <span className={isHovered ? (theme === 'dark' ? 'text-white' : 'text-gray-900') : (theme === 'dark' ? 'text-slate-300' : 'text-gray-700')}>
                          {label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="mt-6 flex items-center justify-center gap-3 text-amber-400">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Wird verarbeitet...</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}
            </div>

            <p className={`text-center text-xs mt-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
              Wähle die Antwort, die am besten zu dir passt.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

// ============================================================================
// LOADING SCREEN
// ============================================================================

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Wird geladen...", subMessage }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-amber-400/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{message}</p>
        {subMessage && <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{subMessage}</p>}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN ASSESSMENT FLOW COMPONENT
// ============================================================================

export const AssessmentFlow: React.FC = () => {
  // Theme State with localStorage persistence
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('gruenderai-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('gruenderai-theme', next);
      return next;
    });
  };

  // Assessment State
  const [state, setState] = useState<AssessmentState>({
    stage: 'welcome',
    name: '',
    email: '',
    businessContext: null,
    sessionId: null,
    currentQuestion: null,
    progress: { items_completed: 0, estimated_remaining: 15, percentage: 0 },
    insights: [],
    questionStartTime: Date.now(),
    results: null,
    isComplete: false,
    isLoading: false,
    error: null,
  });

  // Start Assessment with Business Context
  const startAssessment = async (context: BusinessContext) => {
    setState(prev => ({ ...prev, businessContext: context, isLoading: true, error: null }));

    try {
      // Save intake with full business context
      await api.post('/api/v1/intake', {
        name: state.name,
        email: state.email,
        business_type: context.category,
        business_idea: context.problemStatement,
        target_customer: context.targetCustomer,
        business_stage: context.stage,
        specific_niche: context.specificNiche,
        unique_value: context.uniqueValue,
      });

      // Start assessment session with business context
      const sessionResponse = await api.post('/api/v1/assessment/start', {
        email: state.email,
        business_type: context.category,
        business_context: {
          category: context.category,
          target_customer: context.targetCustomer,
          stage: context.stage,
          specific_niche: context.specificNiche,
          problem_statement: context.problemStatement,
          unique_value: context.uniqueValue,
        }
      });

      const { session_id } = sessionResponse.data;

      // Get first question
      const questionResponse = await api.get(`/api/v1/assessment/${session_id}/next`);

      setState(prev => ({
        ...prev,
        sessionId: session_id,
        currentQuestion: questionResponse.data.question,
        progress: questionResponse.data.progress,
        stage: 'assessment',
        isLoading: false,
        questionStartTime: Date.now(),
      }));

    } catch (error: any) {
      console.error('Error starting assessment:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.detail || 'Fehler beim Starten der Analyse. Bitte versuche es erneut.',
      }));
    }
  };

  // Submit Response
  const submitResponse = async (value: number) => {
    if (!state.currentQuestion || !state.sessionId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.post('/api/v1/assessment/respond', {
        session_id: state.sessionId,
        question_id: state.currentQuestion.id,
        response_value: value,
        response_time_ms: Date.now() - state.questionStartTime
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        progress: response.data.progress,
        insights: response.data.insights || []
      }));

      if (response.data.is_complete || !response.data.question) {
        setState(prev => ({ ...prev, stage: 'results', isComplete: true, currentQuestion: null }));
      } else {
        setState(prev => ({
          ...prev,
          currentQuestion: response.data.question,
          questionStartTime: Date.now()
        }));
      }

    } catch (error: any) {
      console.error('Error submitting response:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.detail || 'Fehler beim Senden der Antwort'
      }));
    }
  };

  // Render based on stage
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* Welcome */}
      {state.stage === 'welcome' && (
        <WelcomeScreen onStart={() => setState(prev => ({ ...prev, stage: 'name' }))} />
      )}

      {/* Name */}
      {state.stage === 'name' && (
        <NameInput onSubmit={(name) => setState(prev => ({ ...prev, name, stage: 'email' }))} />
      )}

      {/* Email */}
      {state.stage === 'email' && (
        <EmailInput 
          userName={state.name} 
          onSubmit={(email) => setState(prev => ({ ...prev, email, stage: 'business_context' }))} 
        />
      )}

      {/* Business Context Capture (Hybrid: Structured + AI Socratic) */}
      {state.stage === 'business_context' && !state.isLoading && (
        <BusinessContextCaptureComponent
          userName={state.name}
          onComplete={(context) => {
            startAssessment(context);
          }}
          theme={theme}
        />
      )}

      {/* Loading */}
      {state.isLoading && !state.currentQuestion && state.stage !== 'results' && (
        <LoadingScreen message="Deine Analyse wird vorbereitet..." subMessage="Das dauert nur einen Moment" />
      )}

      {/* Assessment Questions */}
      {state.stage === 'assessment' && state.currentQuestion && (
        <AssessmentQuestionComponent
          question={state.currentQuestion}
          onRespond={submitResponse}
          isLoading={state.isLoading}
          progress={state.progress}
          insights={state.insights}
          userName={state.name}
          userEmail={state.email}
          error={state.error}
        />
      )}

      {/* Results */}
      {state.stage === 'results' && (
        <ResultsPage sessionId={state.sessionId || undefined} />
      )}
    </ThemeContext.Provider>
  );
};

export default AssessmentFlow;
