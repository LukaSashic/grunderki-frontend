/**
 * BusinessContextCapture.tsx
 * 
 * Hybrid Business Context Capture:
 * Phase 1: Structured multiple-choice (guaranteed data capture)
 * Phase 2: AI Socratic dialogue (natural refinement)
 * 
 * Outputs structured business context for personality scenario personalization
 */

import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface BusinessContext {
  // Phase 1: Structured Data
  category: string;
  categoryLabel: string;
  targetCustomer: string;
  targetCustomerLabel: string;
  stage: string;
  stageLabel: string;
  
  // Phase 2: AI-Extracted Data
  specificNiche: string;
  problemStatement: string;
  uniqueValue: string;
  
  // Metadata
  completedAt: string;
  confidence: number;
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

type Theme = 'dark' | 'light';

interface BusinessContextCaptureProps {
  userName: string;
  onComplete: (context: BusinessContext) => void;
  theme?: Theme;
  apiBaseUrl?: string;
}

// ============================================================================
// ICONS
// ============================================================================

const Icon: React.FC<{ children: React.ReactNode; size?: number; className?: string }> = ({ 
  children, size = 20, className = "" 
}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" 
    strokeLinejoin="round" className={className}>{children}</svg>
);

const Sparkles: React.FC<{ size?: number; className?: string }> = (p) => (
  <Icon {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></Icon>
);

const Send: React.FC<{ size?: number; className?: string }> = (p) => (
  <Icon {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></Icon>
);

const CheckCircle: React.FC<{ size?: number; className?: string }> = (p) => (
  <Icon {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>
);

const Loader: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
  <div className={`animate-spin ${className}`} style={{ width: size, height: size }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  </div>
);

// ============================================================================
// STRUCTURED QUESTION DATA
// ============================================================================

const BUSINESS_CATEGORIES = [
  { id: 'consulting', label: 'Beratung / Coaching', emoji: '💼', hint: 'Unternehmensberatung, Life Coaching, Training' },
  { id: 'tech', label: 'Tech / Software', emoji: '💻', hint: 'Apps, SaaS, Webentwicklung, IT-Services' },
  { id: 'ecommerce', label: 'E-Commerce / Handel', emoji: '🛒', hint: 'Online-Shop, Dropshipping, Retail' },
  { id: 'service', label: 'Dienstleistung', emoji: '🛠️', hint: 'Handwerk, Reparatur, Haushaltsservices' },
  { id: 'creative', label: 'Kreativ / Design', emoji: '🎨', hint: 'Grafik, Foto, Video, Marketing' },
  { id: 'health', label: 'Gesundheit / Wellness', emoji: '💪', hint: 'Fitness, Ernährung, Therapie, Pflege' },
  { id: 'gastro', label: 'Gastronomie / Food', emoji: '🍽️', hint: 'Restaurant, Catering, Food Truck' },
  { id: 'education', label: 'Bildung / Training', emoji: '📚', hint: 'Kurse, Nachhilfe, Workshops' },
];

const TARGET_CUSTOMERS = [
  { id: 'b2b_small', label: 'Kleine Unternehmen (KMU)', emoji: '🏢', hint: '1-50 Mitarbeiter' },
  { id: 'b2b_large', label: 'Größere Unternehmen', emoji: '🏛️', hint: '50+ Mitarbeiter' },
  { id: 'b2c_families', label: 'Familien', emoji: '👨‍👩‍👧‍👦', hint: 'Haushalte mit Kindern' },
  { id: 'b2c_young', label: 'Junge Erwachsene', emoji: '👩‍💻', hint: '18-35 Jahre' },
  { id: 'b2c_professionals', label: 'Berufstätige', emoji: '👔', hint: 'Angestellte, Selbstständige' },
  { id: 'b2c_seniors', label: 'Senioren', emoji: '👴', hint: '60+ Jahre' },
  { id: 'freelancers', label: 'Freelancer / Solopreneure', emoji: '🎒', hint: 'Selbstständige Einzelpersonen' },
  { id: 'mixed', label: 'Gemischt / Verschiedene', emoji: '🌈', hint: 'Mehrere Zielgruppen' },
];

const BUSINESS_STAGES = [
  { id: 'idea', label: 'Nur eine Idee', emoji: '💡', hint: 'Noch nichts konkret umgesetzt' },
  { id: 'planning', label: 'In der Planung', emoji: '📝', hint: 'Recherche und Konzeptentwicklung' },
  { id: 'prototype', label: 'Erste Tests', emoji: '🔧', hint: 'Prototyp oder Pilotprojekt' },
  { id: 'mvp', label: 'Erste Kunden', emoji: '🚀', hint: 'Bereits Umsatz generiert' },
  { id: 'growing', label: 'Im Wachstum', emoji: '📈', hint: 'Aktives Geschäft, will skalieren' },
];

// ============================================================================
// AI SOCRATIC PROMPTS
// ============================================================================

const generateSocraticPrompt = (
  _category: string,
  categoryLabel: string,
  _targetCustomer: string,
  targetCustomerLabel: string,
  stage: string,
  userName: string
): string => {
  return `Du bist ein erfahrener Gründungsberater, der ${userName} hilft, ihre Geschäftsidee zu schärfen.

KONTEXT:
- Geschäftsbereich: ${categoryLabel}
- Zielkunden: ${targetCustomerLabel}
- Phase: ${stage}

DEINE AUFGABE:
1. Stelle EINE fokussierte Frage, um das konkrete Problem zu verstehen, das ${userName} für ihre Zielkunden lösen möchte
2. Sei warm, ermutigend und professionell
3. Verwende "du" (informell)
4. Maximal 2-3 Sätze

WICHTIG:
- Keine generischen Fragen wie "Erzähl mir mehr"
- Beziehe dich konkret auf den gewählten Bereich und die Zielgruppe
- Frage nach dem PROBLEM, nicht nach der Lösung`;
};

const generateFollowUpPrompt = (
  context: Partial<BusinessContext>,
  previousMessages: Message[],
  userName: string
): string => {
  const conversationHistory = previousMessages
    .map(m => `${m.role === 'assistant' ? 'Berater' : userName}: ${m.content}`)
    .join('\n');

  return `Du bist ein erfahrener Gründungsberater im Gespräch mit ${userName}.

BISHERIGER KONTEXT:
- Geschäftsbereich: ${context.categoryLabel || 'Nicht angegeben'}
- Zielkunden: ${context.targetCustomerLabel || 'Nicht angegeben'}

GESPRÄCHSVERLAUF:
${conversationHistory}

DEINE AUFGABE:
Basierend auf der letzten Antwort:
1. Bestätige kurz das Verständnis
2. Stelle EINE Folgefrage zu einem dieser Aspekte (wähle das relevanteste):
   - Was macht ${userName}s Ansatz einzigartig?
   - Warum ist ${userName} die richtige Person für dieses Problem?
   - Was ist der konkrete Mehrwert für die Kunden?

REGELN:
- Maximal 2-3 Sätze
- Warm und ermutigend
- Keine Wiederholungen
- Verwende "du"`;
};

const generateSummaryPrompt = (
  _context: Partial<BusinessContext>,
  messages: Message[],
  userName: string
): string => {
  const conversationHistory = messages
    .map(m => `${m.role === 'assistant' ? 'Berater' : userName}: ${m.content}`)
    .join('\n');

  return `Analysiere dieses Gründungsgespräch und extrahiere strukturierte Informationen.

GESPRÄCHSVERLAUF:
${conversationHistory}

EXTRAHIERE (auf Deutsch):
1. specific_niche: Die spezifische Nische/Spezialisierung (max 10 Worte)
2. problem_statement: Das Hauptproblem, das gelöst wird (max 20 Worte)
3. unique_value: Was den Ansatz einzigartig macht (max 15 Worte)

ANTWORTE NUR IN DIESEM JSON FORMAT:
{
  "specific_niche": "...",
  "problem_statement": "...",
  "unique_value": "...",
  "confidence": 0.8
}

Wenn etwas unklar ist, mache eine vernünftige Annahme basierend auf dem Kontext.
Confidence zwischen 0.5 (unsicher) und 1.0 (sehr klar).`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const BusinessContextCapture: React.FC<BusinessContextCaptureProps> = ({
  userName,
  onComplete,
  theme = 'dark',
  apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
}) => {
  // Phase tracking
  const [phase, setPhase] = useState<'category' | 'customer' | 'stage' | 'socratic' | 'summary'>('category');
  
  // Structured data (Phase 1)
  const [category, setCategory] = useState<string>('');
  const [categoryLabel, setCategoryLabel] = useState<string>('');
  const [targetCustomer, setTargetCustomer] = useState<string>('');
  const [targetCustomerLabel, setTargetCustomerLabel] = useState<string>('');
  const [stage, setStage] = useState<string>('');
  const [stageLabel, setStageLabel] = useState<string>('');
  
  // Socratic dialogue (Phase 2)
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [socraticStep, setSocraticStep] = useState<number>(0);
  const maxSocraticSteps = 2; // 2 AI questions + responses
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when entering socratic phase
  useEffect(() => {
    if (phase === 'socratic') {
      inputRef.current?.focus();
    }
  }, [phase]);

  // Start Socratic dialogue when entering that phase
  useEffect(() => {
    if (phase === 'socratic' && messages.length === 0) {
      startSocraticDialogue();
    }
  }, [phase]);

  // ============================================================================
  // AI INTERACTION
  // ============================================================================

  const callClaudeAPI = async (systemPrompt: string, userMessage?: string): Promise<string> => {
    try {
      // For now, we'll use a simulated response
      // In production, this would call your backend which proxies to Claude API
      const response = await fetch(`${apiBaseUrl}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          user_message: userMessage || '',
          context: {
            category,
            categoryLabel,
            targetCustomer,
            targetCustomerLabel,
            stage,
            stageLabel,
            userName
          }
        })
      });

      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI API Error:', error);
      // Fallback to template-based response
      return getFallbackResponse();
    }
  };

  const getFallbackResponse = (): string => {
    const fallbacks = [
      `Super, ${userName}! Du möchtest also im Bereich ${categoryLabel} für ${targetCustomerLabel} arbeiten. Was ist das größte Problem, das deine Zielkunden aktuell haben und das du lösen möchtest?`,
      `Das klingt spannend! Was unterscheidet deine Idee von dem, was es bereits am Markt gibt?`,
      `Verstehe! Und warum bist gerade du die richtige Person, um dieses Problem zu lösen?`
    ];
    return fallbacks[Math.min(socraticStep, fallbacks.length - 1)];
  };

  const startSocraticDialogue = async () => {
    setIsLoading(true);
    
    try {
      const systemPrompt = generateSocraticPrompt(
        category, categoryLabel, targetCustomer, targetCustomerLabel, stageLabel, userName
      );
      
      const aiResponse = await callClaudeAPI(systemPrompt);
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages([newMessage]);
    } catch (error) {
      console.error('Error starting dialogue:', error);
      // Use fallback
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: getFallbackResponse(),
        timestamp: new Date()
      };
      setMessages([newMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const newStep = socraticStep + 1;
    setSocraticStep(newStep);

    try {
      if (newStep >= maxSocraticSteps) {
        // Final step - generate summary and complete
        await generateSummaryAndComplete([...messages, userMessage]);
      } else {
        // Continue dialogue
        const systemPrompt = generateFollowUpPrompt(
          { category, categoryLabel, targetCustomer, targetCustomerLabel, stageLabel },
          [...messages, userMessage],
          userName
        );
        
        const aiResponse = await callClaudeAPI(systemPrompt, inputValue.trim());
        
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error in dialogue:', error);
      // Use fallback and continue
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: getFallbackResponse(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummaryAndComplete = async (allMessages: Message[]) => {
    setPhase('summary');
    
    try {
      const systemPrompt = generateSummaryPrompt(
        { category, categoryLabel, targetCustomer, targetCustomerLabel, stageLabel },
        allMessages,
        userName
      );
      
      const response = await callClaudeAPI(systemPrompt);
      
      // Try to parse JSON response
      let extracted = {
        specific_niche: categoryLabel,
        problem_statement: 'Hilft ' + targetCustomerLabel,
        unique_value: 'Personalisierter Ansatz',
        confidence: 0.7
      };
      
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extracted = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.log('Using fallback extraction');
      }

      // Build complete context
      const completeContext: BusinessContext = {
        category,
        categoryLabel,
        targetCustomer,
        targetCustomerLabel,
        stage,
        stageLabel,
        specificNiche: extracted.specific_niche,
        problemStatement: extracted.problem_statement,
        uniqueValue: extracted.unique_value,
        completedAt: new Date().toISOString(),
        confidence: extracted.confidence || 0.7
      };

      // Short delay to show summary animation
      setTimeout(() => {
        onComplete(completeContext);
      }, 1500);

    } catch (error) {
      console.error('Summary generation error:', error);
      // Complete with basic data
      const basicContext: BusinessContext = {
        category,
        categoryLabel,
        targetCustomer,
        targetCustomerLabel,
        stage,
        stageLabel,
        specificNiche: categoryLabel,
        problemStatement: `Lösungen für ${targetCustomerLabel}`,
        uniqueValue: 'Individueller Ansatz',
        completedAt: new Date().toISOString(),
        confidence: 0.6
      };
      
      setTimeout(() => {
        onComplete(basicContext);
      }, 1500);
    }
  };

  // ============================================================================
  // PHASE 1: STRUCTURED SELECTION HANDLERS
  // ============================================================================

  const handleCategorySelect = (cat: typeof BUSINESS_CATEGORIES[0]) => {
    setCategory(cat.id);
    setCategoryLabel(cat.label);
    setPhase('customer');
  };

  const handleCustomerSelect = (cust: typeof TARGET_CUSTOMERS[0]) => {
    setTargetCustomer(cust.id);
    setTargetCustomerLabel(cust.label);
    setPhase('stage');
  };

  const handleStageSelect = (stg: typeof BUSINESS_STAGES[0]) => {
    setStage(stg.id);
    setStageLabel(stg.label);
    setPhase('socratic');
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderProgressDots = () => {
    const phases = ['category', 'customer', 'stage', 'socratic', 'summary'];
    const currentIndex = phases.indexOf(phase);
    
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {phases.slice(0, 4).map((_, idx) => (
          <div 
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              idx <= currentIndex ? 'bg-amber-500' : theme === 'dark' ? 'bg-slate-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderSelectionCard = (
    item: { id: string; label: string; emoji: string; hint: string },
    onClick: () => void,
    isSelected: boolean
  ) => (
    <button
      key={item.id}
      onClick={onClick}
      className={`
        p-4 rounded-xl border-2 transition-all duration-200 text-left
        hover:scale-[1.02] hover:border-amber-500
        ${isSelected 
          ? 'border-amber-500 bg-amber-500/10' 
          : theme === 'dark' 
            ? 'border-slate-700 bg-slate-800/30 hover:bg-slate-800/50' 
            : 'border-gray-200 bg-white hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{item.emoji}</span>
        <div>
          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {item.label}
          </p>
          <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            {item.hint}
          </p>
        </div>
      </div>
    </button>
  );

  // ============================================================================
  // RENDER PHASES
  // ============================================================================

  const renderCategoryPhase = () => (
    <div className={`
      rounded-2xl p-6 md:p-8
      ${theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/50' : 'bg-white shadow-xl'}
    `}>
      {renderProgressDots()}
      
      <h2 className={`text-xl md:text-2xl font-bold mb-2 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        In welchem Bereich startest du, {userName}?
      </h2>
      <p className={`mb-6 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
        Wähle die Kategorie, die am besten zu deiner Geschäftsidee passt.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {BUSINESS_CATEGORIES.map(cat => 
          renderSelectionCard(cat, () => handleCategorySelect(cat), category === cat.id)
        )}
      </div>
    </div>
  );

  const renderCustomerPhase = () => (
    <div className={`
      rounded-2xl p-6 md:p-8
      ${theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/50' : 'bg-white shadow-xl'}
    `}>
      {renderProgressDots()}
      
      {/* Selected category badge */}
      <div className="flex justify-center mb-4">
        <span className={`
          inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
          ${theme === 'dark' ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}
        `}>
          {BUSINESS_CATEGORIES.find(c => c.id === category)?.emoji} {categoryLabel}
        </span>
      </div>
      
      <h2 className={`text-xl md:text-2xl font-bold mb-2 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Wer sind deine Hauptkunden?
      </h2>
      <p className={`mb-6 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
        Für wen löst du ein Problem?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TARGET_CUSTOMERS.map(cust => 
          renderSelectionCard(cust, () => handleCustomerSelect(cust), targetCustomer === cust.id)
        )}
      </div>
    </div>
  );

  const renderStagePhase = () => (
    <div className={`
      rounded-2xl p-6 md:p-8
      ${theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/50' : 'bg-white shadow-xl'}
    `}>
      {renderProgressDots()}
      
      {/* Selected badges */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        <span className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
          ${theme === 'dark' ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}
        `}>
          {BUSINESS_CATEGORIES.find(c => c.id === category)?.emoji} {categoryLabel}
        </span>
        <span className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
          ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}
        `}>
          {TARGET_CUSTOMERS.find(c => c.id === targetCustomer)?.emoji} {targetCustomerLabel}
        </span>
      </div>
      
      <h2 className={`text-xl md:text-2xl font-bold mb-2 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Wo stehst du gerade?
      </h2>
      <p className={`mb-6 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
        Das hilft uns, die richtigen Fragen zu stellen.
      </p>

      <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
        {BUSINESS_STAGES.map(stg => 
          renderSelectionCard(stg, () => handleStageSelect(stg), stage === stg.id)
        )}
      </div>
    </div>
  );

  const renderSocraticPhase = () => (
    <div className={`
      rounded-2xl p-6 md:p-8
      ${theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/50' : 'bg-white shadow-xl'}
    `}>
      {renderProgressDots()}
      
      {/* Context badges */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        <span className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
          ${theme === 'dark' ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}
        `}>
          {categoryLabel}
        </span>
        <span className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
          ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}
        `}>
          {targetCustomerLabel}
        </span>
        <span className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
          ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}
        `}>
          {stageLabel}
        </span>
      </div>

      {/* Chat messages */}
      <div className={`
        min-h-[200px] max-h-[300px] overflow-y-auto mb-4 space-y-4 p-2
        ${theme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}
      `}>
        {messages.map(msg => (
          <div 
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>
            )}
            <div className={`
              max-w-[80%] p-3 rounded-2xl
              ${msg.role === 'assistant'
                ? theme === 'dark' ? 'bg-slate-700 rounded-tl-none' : 'bg-gray-100 rounded-tl-none'
                : 'bg-amber-500 text-white rounded-tr-none'
              }
            `}>
              <p className={msg.role === 'assistant' ? (theme === 'dark' ? 'text-slate-200' : 'text-gray-700') : ''}>
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className={`
              p-3 rounded-2xl rounded-tl-none
              ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'}
            `}>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Deine Antwort..."
          rows={2}
          disabled={isLoading}
          className={`
            w-full p-4 pr-14 border-2 rounded-xl outline-none transition-all resize-none
            ${theme === 'dark' 
              ? 'bg-slate-800/50 text-white placeholder-slate-500 border-slate-700 focus:border-amber-500' 
              : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-amber-500'
            }
            ${isLoading ? 'opacity-50' : ''}
          `}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className={`
            absolute right-3 bottom-3 p-2 rounded-lg transition-all
            ${inputValue.trim() && !isLoading
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-gray-200 text-gray-400'
            }
          `}
        >
          <Send size={18} />
        </button>
      </div>

      <p className={`text-xs text-center mt-3 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
        {socraticStep + 1} von {maxSocraticSteps + 1} · Drücke Enter zum Senden
      </p>
    </div>
  );

  const renderSummaryPhase = () => (
    <div className={`
      rounded-2xl p-8 text-center
      ${theme === 'dark' ? 'bg-slate-800/40 border border-slate-700/50' : 'bg-white shadow-xl'}
    `}>
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
        <CheckCircle size={32} className="text-white" />
      </div>
      
      <h2 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Perfekt, {userName}! 🎉
      </h2>
      <p className={`mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
        Dein Geschäftsprofil wird erstellt...
      </p>

      {/* Summary cards */}
      <div className={`
        grid grid-cols-3 gap-3 p-4 rounded-xl
        ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-50'}
      `}>
        <div className="text-center">
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Bereich</p>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{categoryLabel}</p>
        </div>
        <div className="text-center">
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Zielgruppe</p>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{targetCustomerLabel}</p>
        </div>
        <div className="text-center">
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Phase</p>
          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stageLabel}</p>
        </div>
      </div>

      <div className="mt-6">
        <Loader size={24} className="mx-auto text-amber-500" />
        <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
          Weiter zur Persönlichkeitsanalyse...
        </p>
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      {/* Header */}
      <header className={`
        border-b sticky top-0 z-50 backdrop-blur-sm
        ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-gray-200 bg-white/80'}
      `}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-white text-lg">🚀</span>
            </div>
            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              GründerAI
            </span>
          </div>
          <span className={`
            text-xs px-3 py-1 rounded-full
            ${theme === 'dark' ? 'text-slate-400 bg-slate-800' : 'text-gray-500 bg-gray-100'}
          `}>
            Geschäftsprofil
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {phase === 'category' && renderCategoryPhase()}
        {phase === 'customer' && renderCustomerPhase()}
        {phase === 'stage' && renderStagePhase()}
        {phase === 'socratic' && renderSocraticPhase()}
        {phase === 'summary' && renderSummaryPhase()}
      </main>
    </div>
  );
};

export default BusinessContextCapture;
