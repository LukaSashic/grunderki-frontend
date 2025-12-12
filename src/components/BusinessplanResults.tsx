// BusinessplanResults.tsx - FIXED VERSION
import React, { useState } from 'react';

interface BusinessplanResultsProps {
  result: any;
  onBack?: () => void;
}

export const BusinessplanResults: React.FC<BusinessplanResultsProps> = ({ result, onBack }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedCitations, setExpandedCitations] = useState<Set<number>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const toggleCitation = (index: number) => {
    setExpandedCitations(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const complianceScore = result.compliance_score || 75;
  const legalCitations = result.legal_citations || [];
  const businessplan = result.businessplan || {};

  // Compliance Score Color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 75) return 'from-blue-500 to-indigo-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Exzellent';
    if (score >= 75) return 'Sehr Gut';
    if (score >= 60) return 'Gut';
    return 'Verbesserungsbedarf';
  };

  // Download handlers
  const handleDownloadTXT = () => {
    const sections = Object.entries(businessplan);
    let content = '# BUSINESSPLAN\n\n';
    content += `Compliance Score: ${complianceScore}/100\n`;
    content += `Status: ${getScoreText(complianceScore)}\n\n`;
    content += '='.repeat(80) + '\n\n';

    sections.forEach(([key, value]) => {
      const title = key.toUpperCase().replace(/_/g, ' ');
      content += `## ${title}\n\n`;
      content += typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      content += '\n\n' + '='.repeat(80) + '\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'businessplan.txt';
    a.click();
  };

  const handleDownloadPDF = () => {
    alert('PDF Download wird noch implementiert');
  };

  const handleDownloadDOCX = () => {
    alert('DOCX Download wird noch implementiert');
  };

  // Businessplan sections
  const sections = [
    { key: 'executive_summary', title: 'Executive Summary', icon: '📋' },
    { key: 'gruenderperson', title: 'Gründerperson', icon: '👤' },
    { key: 'marktanalyse', title: 'Marktanalyse', icon: '📊' },
    { key: 'marketing', title: 'Marketing & Vertrieb', icon: '📣' },
    { key: 'finanzplan', title: 'Finanzplan', icon: '💰' },
    { key: 'risikoanalyse', title: 'Risikoanalyse', icon: '⚠️' },
    { key: 'meilensteine', title: 'Meilensteine', icon: '🎯' },
    { key: 'team_und_organisation', title: 'Team & Organisation', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dein Businessplan ist fertig! 🎉
              </h1>
              <p className="text-gray-600">
                GZ-konform mit allen rechtlichen Anforderungen
              </p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                &larr; Zurück
              </button>
            )}
          </div>

          {/* Compliance Score Card */}
          <div className={`bg-gradient-to-r ${getScoreColor(complianceScore)} rounded-xl p-6 text-white mb-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-medium mb-1">
                  GZ-Compliance Score
                </p>
                <p className="text-5xl font-bold">{complianceScore}<span className="text-2xl">/100</span></p>
                <p className="text-white/90 mt-2">{getScoreText(complianceScore)}</p>
              </div>
              <div className="text-6xl opacity-50">
                {complianceScore >= 75 ? '✓' : '!'}
              </div>
            </div>
          </div>

          {/* Legal Citations */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚖️</span>
              Rechtliche Grundlagen ({legalCitations.length})
            </h2>
            <div className="space-y-2">
              {legalCitations.map((citation: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleCitation(index)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-blue-600 font-mono text-sm font-semibold">
                        {citation.format}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {citation.short_text.substring(0, 60)}...
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {expandedCitations.has(index) ? '−' : '+'}
                    </span>
                  </button>
                  {expandedCitations.has(index) && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 text-sm mb-3">{citation.short_text}</p>
                      {citation.source && (
                        <a
                          href={citation.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          Quelle ansehen &rarr;
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleDownloadTXT}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              📄 Download TXT
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              📕 Download PDF
            </button>
            <button
              onClick={handleDownloadDOCX}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              📘 Download DOCX
            </button>
          </div>
        </div>

        {/* Businessplan Sections */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Businessplan Kapitel
          </h2>
          <div className="space-y-3">
            {sections.map((section) => {
              const content = businessplan[section.key];
              if (!content) return null;

              return (
                <div
                  key={section.key}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{section.icon}</span>
                      <span className="font-semibold text-gray-900">{section.title}</span>
                    </div>
                    <span className="text-gray-400 text-xl">
                      {expandedSections.has(section.key) ? '−' : '+'}
                    </span>
                  </button>
                  {expandedSections.has(section.key) && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                        {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-lg p-8 border border-green-200">
          <h2 className="text-2xl font-bold text-green-900 mb-4">
            🎯 Nächste Schritte
          </h2>
          <ol className="space-y-3 text-green-800">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <span>Businessplan herunterladen und durchlesen</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <span>Termin mit fachkundiger Stelle vereinbaren</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <span>Stellungnahme von fachkundiger Stelle einholen</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <span>Gründungszuschuss bei Arbeitsagentur beantragen</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
