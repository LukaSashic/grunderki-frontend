// src/components/AssessmentFlow.tsx
// Main assessment component with Socratic Business Idea + Progressive Intake + API integration
// 
// ✨ NEW: Integrated Socratic Business Idea Discovery
// Flow: Name/Email → Socratic Dialogue → Context Questions → Assessment → Results

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProgressiveIntake } from './ProgressiveIntake';
import { SocraticBusinessIdea } from './SocraticBusinessIdea'; // ✨ NEW IMPORT

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Configure axios with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Types
interface IntakeData {
  name: string;
  email: string;
  businessIdea: string;
  businessType: string;
  experienceLevel: string;
  timeline: string;
  gzInterest: string;
  growthVision: string;
}

// ✨ NEW: Business Context from Socratic Dialogue
interface BusinessContext {
  what?: string;
  who?: string;
  problem?: string;
  why_you?: string;
  how?: string;
  confidence: number;
}

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

interface Response {
  question_id: string;
  value: number;
}

interface Results {
  session_id: string;
  personality_profile: any;
  business_compatibility: any;
  gz_prediction: any;
}

interface NextQuestionResponse {
  question: Question | null;
  progress: Progress;
  insights: string[];
  is_complete: boolean;
}

// ✨ UPDATED: New state structure with flow stages
interface AssessmentState {
  // Flow Control - NEW!
  stage: 'basic_info' | 'socratic' | 'context_questions' | 'assessment' | 'results';
  
  // User Data - Split from intakeData
  name: string;
  email: string;
  businessIdea: string;
  businessContext: BusinessContext | null; // ✨ NEW
  
  // Progressive Intake
  intakeComplete: boolean;
  intakeData: IntakeData | null;
  
  // Assessment
  sessionId: string | null;
  currentQuestion: Question | null;
  progress: Progress;
  insights: string[];
  responses: Response[];
  questionStartTime: number;
  results: Results | null;
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

export const AssessmentFlow: React.FC = () => {
  const [state, setState] = useState<AssessmentState>({
    // ✨ NEW: Flow stages
    stage: 'basic_info',
    
    // ✨ NEW: Separate user data
    name: '',
    email: '',
    businessIdea: '',
    businessContext: null,
    
    // Progressive Intake
    intakeComplete: false,
    intakeData: null,
    
    // Assessment
    sessionId: null,
    currentQuestion: null,
    progress: { items_completed: 0, estimated_remaining: 0, percentage: 0 },
    insights: [],
    responses: [],
    questionStartTime: Date.now(),
    results: null,
    isComplete: false,
    isLoading: false,
    error: null,
  });

  // ✨ NEW: Handler for basic info (name + email only)
  const handleBasicInfoComplete = (intakeData: IntakeData) => {
    console.log('Basic info collected:', intakeData.name, intakeData.email);
    
    setState(prev => ({
      ...prev,
      name: intakeData.name,
      email: intakeData.email,
      stage: 'socratic', // ✨ Move to Socratic stage
    }));
  };

  // ✨ NEW: Handler for Socratic dialogue completion
  const handleSocraticComplete = (context: BusinessContext, summary: string) => {
    console.log('Socratic dialogue completed:', { context, summary });
    
    setState(prev => ({
      ...prev,
      businessIdea: summary,
      businessContext: context,
      stage: 'context_questions', // ✨ Move to context questions
    }));
  };

  // ✨ UPDATED: Handle context questions completion (rest of intake)
  const handleContextQuestionsComplete = async (intakeData: IntakeData) => {
    console.log('Context questions completed:', intakeData);
    
    // Combine all collected data
    const fullIntakeData: IntakeData = {
      name: state.name,
      email: state.email,
      businessIdea: state.businessIdea,
      businessType: intakeData.businessType,
      experienceLevel: intakeData.experienceLevel,
      timeline: intakeData.timeline,
      gzInterest: intakeData.gzInterest,
      growthVision: intakeData.growthVision,
    };
    
    setState(prev => ({
      ...prev,
      intakeComplete: true,
      intakeData: fullIntakeData,
      isLoading: true,
    }));

    try {
      // 1. Save intake to backend
      console.log('Saving intake data to backend...');
      const intakeResponse = await api.post('/api/v1/intake', {
        name: fullIntakeData.name,
        email: fullIntakeData.email,
        business_idea: fullIntakeData.businessIdea,
        business_context: state.businessContext, // ✨ NEW: Send Socratic context
        business_type: fullIntakeData.businessType,
        experience_level: fullIntakeData.experienceLevel,
        timeline: fullIntakeData.timeline,
        gz_interest: fullIntakeData.gzInterest,
        growth_vision: fullIntakeData.growthVision,
      });
      
      console.log('Intake saved:', intakeResponse.data);
      const sessionId = intakeResponse.data.session_id;

      // 2. Start assessment with session
      console.log('Starting assessment with session:', sessionId);
      const assessmentResponse = await api.post('/api/v1/assessment/start', {
        session_id: sessionId,
      });

      console.log('Assessment started:', assessmentResponse.data);

      setState(prev => ({
        ...prev,
        stage: 'assessment', // ✨ Move to assessment stage
        sessionId: sessionId,
        currentQuestion: assessmentResponse.data.first_question,
        questionStartTime: Date.now(),
        isLoading: false,
      }));

    } catch (error: any) {
      console.error('Failed to start assessment:', error);
      
      // Fallback: Start without backend (for testing when Railway is down)
      if (error.message.includes('Network Error') || error.response?.status >= 500) {
        console.warn('Backend unavailable, starting local assessment...');
        
        const localSessionId = `local_${Date.now()}`;
        
        setState(prev => ({
          ...prev,
          stage: 'assessment',
          sessionId: localSessionId,
          currentQuestion: {
            id: "INNOV_001",
            text_de: "Ich suche aktiv nach neuen Wegen, um mein Geschäft zu innovieren.",
            dimension: "innovativeness",
            response_scale: {
              1: "Trifft gar nicht zu",
              2: "Trifft eher nicht zu",
              3: "Neutral",
              4: "Trifft eher zu",
              5: "Trifft voll zu"
            }
          },
          questionStartTime: Date.now(),
          isLoading: false,
        }));
        
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.response?.data?.detail || 'Fehler beim Starten des Assessments',
        }));
      }
    }
  };

  // Submit Response (unchanged)
  const submitResponse = async (value: number) => {
    if (!state.currentQuestion || !state.sessionId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Submitting response:', value);
      
      const response = await api.post<NextQuestionResponse>(
        '/api/v1/assessment/respond',
        {
          session_id: state.sessionId,
          question_id: state.currentQuestion.id,
          response_value: value,
          response_time_ms: Date.now() - state.questionStartTime
        }
      );

      console.log('Response submitted:', response.data);

      setState(prev => ({
        ...prev,
        isLoading: false,
        responses: [...prev.responses, { question_id: state.currentQuestion!.id, value }],
        progress: response.data.progress,
        insights: response.data.insights || []
      }));

      // Check if complete OR no more questions
      if (response.data.is_complete || !response.data.question) {
        console.log('Assessment complete! Loading results...');
        setState(prev => ({ 
          ...prev,
          stage: 'results', // ✨ Move to results stage
          isComplete: true,
          currentQuestion: null 
        }));
      } else {
        // Move to next question
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
        error: error.response?.data?.error || 'Fehler beim Senden der Antwort'
      }));
    }
  };

  // Fetch results (unchanged)
  const fetchResults = async () => {
    if (!state.sessionId) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await api.get(`/api/v1/assessment/${state.sessionId}/results`);
      console.log('Results:', response.data);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        results: response.data
      }));
      
    } catch (error: any) {
      console.error('Failed to fetch results:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Fehler beim Laden der Ergebnisse',
      }));
    }
  };

  // Effect: Fetch results when complete
  useEffect(() => {
    if (state.stage === 'results' && state.sessionId && !state.results) {
      fetchResults();
    }
  }, [state.stage]);

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get('/api/health');
        console.log('API Health Check:', response.data);
      } catch (error) {
        console.error('API Connection Failed:', error);
      }
    };
    testConnection();
  }, []);

  // ============================================================================
  // ✨ NEW: STAGE-BASED RENDERING
  // ============================================================================

  // STAGE 1: Basic Info (Name + Email only)
  if (state.stage === 'basic_info') {
  return (
    <ProgressiveIntake 
      onComplete={handleBasicInfoComplete}
    />
  );
}

  // ✨ NEW: STAGE 2: Socratic Business Idea Discovery
  if (state.stage === 'socratic') {
    return (
      <SocraticBusinessIdea
        userName={state.name}
        userEmail={state.email}
        onComplete={handleSocraticComplete}
      />
    );
  }

  // ✨ NEW: STAGE 3: Context Questions (rest of intake)
  if (state.stage === 'context_questions') {
  return (
    <ProgressiveIntake 
      onComplete={handleContextQuestionsComplete}
    />
  );
}

  // Loading state
  if (state.isLoading && !state.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            {state.stage === 'assessment' ? 'Starte Assessment...' : 'Lädt...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error && !state.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-5xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Ein Fehler ist aufgetreten
          </h2>
          <p className="text-gray-600 mb-6 text-center">{state.error}</p>
          <button 
            onClick={() => setState(prev => ({ 
              ...prev, 
              error: null, 
              stage: 'basic_info',
              name: '',
              email: '',
              businessIdea: '',
              businessContext: null,
              intakeComplete: false
            }))}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  // STAGE 4: Assessment Questions
  if (state.stage === 'assessment' && state.currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* User Info Badge */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {state.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{state.name}</p>
                <p className="text-xs text-gray-500">{state.email}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt</span>
              <span>{state.progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${state.progress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Noch ca. {state.progress.estimated_remaining} Fragen
            </p>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {state.currentQuestion.text_de}
            </h2>

            {/* Response Options */}
            <div className="space-y-3">
              {Object.entries(state.currentQuestion.response_scale).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => submitResponse(parseInt(value))}
                  disabled={state.isLoading}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium mr-3">
                      {value}
                    </span>
                    <span className="text-gray-700">{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Insights */}
          {state.insights.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">💡 Ihre Stärken:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                {state.insights.map((insight, idx) => (
                  <li key={idx}>• {insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Error Display */}
          {state.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{state.error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STAGE 5: Results
  if (state.stage === 'results') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Assessment Abgeschlossen!
          </h2>
          <p className="text-gray-600">
            Vielen Dank, {state.name}! Ihre Persönlichkeitsanalyse ist fertig.
          </p>
        </div>

        {/* Results Loading or Display */}
        {state.isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600 text-lg">Ergebnisse werden analysiert...</span>
          </div>
        ) : state.results ? (
          <div className="space-y-6">
            {/* GZ Prediction Card */}
            {state.results.gz_prediction && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Gründungszuschuss Prognose</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-blue-100 text-sm mb-2">Gesamtscore</p>
                    <p className="text-5xl font-bold">{state.results.gz_prediction.overall_score}/100</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm mb-2">Bewilligungswahrscheinlichkeit</p>
                    <p className="text-5xl font-bold">
                      {Math.round(state.results.gz_prediction.approval_probability * 100)}%
                    </p>
                  </div>
                </div>
                
                {/* Key Strengths */}
                {state.results.gz_prediction.key_strengths && state.results.gz_prediction.key_strengths.length > 0 && (
                  <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-lg">
                    <h4 className="font-semibold mb-2">✅ Ihre Stärken:</h4>
                    <ul className="space-y-1 text-sm">
                      {state.results.gz_prediction.key_strengths.map((strength: string, idx: number) => (
                        <li key={idx}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Areas to Address */}
                {state.results.gz_prediction.areas_to_address && state.results.gz_prediction.areas_to_address.length > 0 && (
                  <div className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg">
                    <h4 className="font-semibold mb-2">💡 Zu beachten im Businessplan:</h4>
                    <ul className="space-y-1 text-sm">
                      {state.results.gz_prediction.areas_to_address.map((area: string, idx: number) => (
                        <li key={idx}>• {area}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Personality Profile */}
            {state.results.personality_profile && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Ihr Persönlichkeitsprofil</h3>
                <div className="space-y-6">
                  {Object.entries(state.results.personality_profile).map(([dimension, data]: [string, any]) => (
                    <div key={dimension}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 capitalize">
                          {dimension.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-semibold text-blue-600">
                          {data.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            data.score >= 80 ? 'bg-green-500' :
                            data.score >= 65 ? 'bg-blue-500' :
                            data.score >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${data.score}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{data.interpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Compatibility */}
            {state.results.business_compatibility && state.results.business_compatibility.recommended_models && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Empfohlene Geschäftsmodelle</h3>
                <div className="space-y-4">
                  {state.results.business_compatibility.recommended_models.map((model: any, idx: number) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{model.name}</h4>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(model.compatibility * 100)}% Match
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span>GZ-Bewilligungsrate:</span>
                        <span className="ml-2 font-semibold text-blue-600">
                          {Math.round(model.gz_approval_probability * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Nächste Schritte</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">1</span>
                  <p>Laden Sie Ihre Ergebnisse herunter (PDF-Export coming soon)</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">2</span>
                  <p>Erstellen Sie Ihren optimierten Businessplan (AI-generiert)</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">3</span>
                  <p>Beantragen Sie den Gründungszuschuss mit höherer Erfolgswahrscheinlichkeit</p>
                </div>
              </div>
              <button className="mt-6 w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-purple-50 transition-colors">
                Jetzt Businessplan erstellen
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">Keine Ergebnisse verfügbar. Bitte versuchen Sie es erneut.</p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default AssessmentFlow;