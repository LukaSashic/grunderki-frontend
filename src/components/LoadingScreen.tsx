// LoadingScreen.tsx
import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  estimatedTime?: number; // in seconds
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  estimatedTime = 300 // 5 minutes default
}) => {
  const [progress, setProgress] = useState(15);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const steps = [
    { text: 'Geschäftsidee analysiert', icon: '🎯', threshold: 20 },
    { text: 'Marktdaten recherchiert', icon: '📊', threshold: 35 },
    { text: 'Rechtliche Prüfung durchgeführt', icon: '⚖️', threshold: 50 },
    { text: 'Finanzplan berechnet', icon: '💰', threshold: 65 },
    { text: 'Businessplan erstellt', icon: '📝', threshold: 80 },
    { text: 'Compliance-Check abgeschlossen', icon: '✅', threshold: 95 },
  ];

  const tips = [
    '💡 Der Gründungszuschuss beträgt bis zu 31.500€ über 2 Jahre',
    '📋 Ein guter Businessplan ist 15-25 Seiten lang',
    '⏰ Die Bearbeitung dauert bei der Arbeitsagentur 2-4 Wochen',
    '🎓 Über 60% der Anträge werden beim ersten Versuch bewilligt',
    '💼 Hauptberuflichkeit bedeutet mindestens 15 Stunden pro Woche',
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 2 + 0.5;
        return Math.min(prev + increment, 95);
      });
    }, 1000);

    // Update current step based on progress
    const stepInterval = setInterval(() => {
      const currentStepIndex = steps.findIndex(step => progress < step.threshold);
      setCurrentStep(currentStepIndex === -1 ? steps.length - 1 : Math.max(0, currentStepIndex - 1));
    }, 500);

    // Elapsed time counter
    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Rotate tips
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % tips.length);
    }, 8000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(timeInterval);
      clearInterval(tipInterval);
    };
  }, [progress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = Math.max(0, estimatedTime - elapsedTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dein Businessplan wird erstellt
          </h2>
          <p className="text-gray-600">
            Claude analysiert deine Geschäftsidee und erstellt einen GZ-konformen Businessplan
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Fortschritt</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="mb-8 space-y-3">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-green-50 border-l-4 border-green-500' 
                  : 'bg-gray-50 opacity-50'
              }`}
            >
              <span className="text-2xl">{step.icon}</span>
              <span className={`font-medium ${
                index <= currentStep ? 'text-green-900' : 'text-gray-600'
              }`}>
                {step.text}
              </span>
              {index <= currentStep && (
                <span className="ml-auto text-green-600">✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Time Estimate */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-900 font-medium">Verstrichene Zeit</p>
              <p className="text-2xl font-bold text-blue-600">{formatTime(elapsedTime)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-900 font-medium">Verbleibend (ca.)</p>
              <p className="text-2xl font-bold text-blue-600">{formatTime(remainingTime)}</p>
            </div>
          </div>
        </div>

        {/* Rotating Tips */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <p className="font-medium text-indigo-900 mb-1">Wusstest du?</p>
              <p className="text-indigo-700 text-sm leading-relaxed">
                {tips[currentTip]}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Bitte schließe diese Seite nicht. Die Generierung kann 5-10 Minuten dauern.
        </p>
      </div>
    </div>
  );
};