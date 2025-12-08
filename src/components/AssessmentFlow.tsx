// src/components/AssessmentFlow.tsx
// Main assessment component with proper API integration

import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

interface AssessmentState {
  sessionId: string | null;
  currentQuestion: Question | null;
  progress: Progress;
  insights: string[];
  responses: Response[];  // ← WICHTIG!
  questionStartTime: number;  // ← WICHTIG!
  results: Results | null;  // ← WICHTIG!
  isComplete: boolean;
  isLoading: boolean;
  error: string | null;
}

export const AssessmentFlow: React.FC = () => {
  const [state, setState] = useState<AssessmentState>({
    sessionId: null,
    currentQuestion: null,
    progress: { items_completed: 0, estimated_remaining: 0, percentage: 0 },
    insights: [],
    responses: [],  // ← WICHTIG: Leeres Array!
    questionStartTime: Date.now(),  // ← WICHTIG!
    results: null,  // ← WICHTIG!
    isComplete: false,
    isLoading: false,
    error: null,
  });

  const [businessIdea, setBusinessIdea] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  // Start assessment
  const startAssessment = async () => {
    if (!businessIdea || businessIdea.length < 10) {
      setState(prev => ({ ...prev, error: 'Bitte beschreiben Sie Ihre Geschäftsidee (mindestens 10 Zeichen)' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Starting assessment with business idea:', businessIdea);
      
      const response = await api.post('/api/v1/assessment/start', {
        business_idea: businessIdea,
        preferred_language: 'de',
      });

      console.log('Assessment started:', response.data);

      setState(prev => ({
        ...prev,
        sessionId: response.data.session_id,
        currentQuestion: response.data.first_question,
        isLoading: false,
      }));

      setHasStarted(true);
    } catch (error: any) {
      console.error('Failed to start assessment:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.detail || error.message || 'Fehler beim Starten der Bewertung',
      }));
    }
  };

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
        isComplete: true,
        currentQuestion: null 
      }));
      // Results will be loaded by useEffect
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
 // Fetch results
const fetchResults = async () => {
  if (!state.sessionId) return;

  setState(prev => ({ ...prev, isLoading: true }));

  try {
    const response = await api.get(`/api/v1/assessment/${state.sessionId}/results`);
    console.log('Results:', response.data);
    
    // WICHTIG: Results im State speichern!
    setState(prev => ({
      ...prev,
      isLoading: false,
      results: response.data  // ← Das war das fehlende Stück!
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
    if (state.isComplete && state.sessionId) {
      fetchResults();
    }
  }, [state.isComplete]);

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

  // Render: Start Screen
  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            GründerAI Persönlichkeits-Assessment
          </h1>
          <p className="text-gray-600 mb-6">
            Optimieren Sie Ihre Gründungszuschuss-Bewerbung durch wissenschaftlich fundierte Persönlichkeitsanalyse.
          </p>

          {/* Business Idea Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschreiben Sie kurz Ihre Geschäftsidee:
            </label>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="z.B. Ich möchte ein B2B Consulting-Unternehmen für Digitalisierung in KMUs gründen..."
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              disabled={state.isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              {businessIdea.length} / 1000 Zeichen
            </p>
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{state.error}</p>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={startAssessment}
            disabled={state.isLoading || businessIdea.length < 10}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {state.isLoading ? 'Wird gestartet...' : 'Assessment Starten'}
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              ⏱️ Geschätzte Dauer: 12-15 Minuten<br />
              📊 Basiert auf wissenschaftlicher Forschung<br />
              🔒 Ihre Daten werden sicher behandelt
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render: Question Screen
  if (!state.isComplete && state.currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt</span>
              <span>{state.progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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

  // Render: Completion Screen with Results
if (state.isComplete) {
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
          Ihre Persönlichkeitsanalyse ist fertig
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
                    {state.results.gz_prediction.key_strengths.map((strength, idx) => (
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
                    {state.results.gz_prediction.areas_to_address.map((area, idx) => (
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

          {/* Insights from Assessment */}
          {state.insights.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Erkenntnisse aus dem Assessment</h3>
              <div className="space-y-3">
                {state.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700">{insight}</p>
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
