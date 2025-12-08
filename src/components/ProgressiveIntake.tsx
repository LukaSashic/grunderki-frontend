// src/components/ProgressiveIntake.tsx
import React, { useState } from 'react';
import './ProgressiveIntake.css';

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

interface Props {
  onComplete: (data: IntakeData) => void;
}

export const ProgressiveIntake: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<IntakeData>>({});
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false);

  // Email validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(re.test(email));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const goToNext = (key: keyof IntakeData, value: string) => {
    setData({ ...data, [key]: value });
    setStep(step + 1);
  };

  const completeIntake = (key: keyof IntakeData, value: string) => {
    const finalData = { ...data, [key]: value } as IntakeData;
    onComplete(finalData);
  };

  // STEP 1: Name Capture
  if (step === 1) {
    return (
      <div className="intake-container">
        <div className="intake-card animate-fade-in">
          <div className="ai-avatar">
            <div className="avatar-icon">🤖</div>
            <div className="avatar-pulse"></div>
          </div>
          
          <h1 className="intake-title">
            Hallo! Ich bin dein persönlicher Gründungsberater.
          </h1>
          
          <p className="intake-subtitle">
            Lass uns gemeinsam deine perfekte Gründungszuschuss-Bewerbung erstellen.
          </p>
          
          <div className="question-box">
            <label className="question-label">
              Wie darf ich dich nennen?
            </label>
            <input
              type="text"
              className="intake-input"
              placeholder="Dein Vorname..."
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.length >= 2) {
                  goToNext('name', e.currentTarget.value);
                }
              }}
            />
            <p className="input-hint">Drücke Enter zum Fortfahren</p>
          </div>

          <div className="trust-footer">
            <span className="trust-item">🔒 100% vertraulich</span>
            <span className="trust-item">⚡ 12 Minuten</span>
            <span className="trust-item">🎯 Wissenschaftlich fundiert</span>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Email Capture
  if (step === 2) {
    return (
      <div className="intake-container">
        <div className="intake-card animate-fade-in">
          <div className="progress-dots">
            <span className="dot completed">●</span>
            <span className="dot active">●</span>
            <span className="dot">○</span>
            <span className="dot">○</span>
            <span className="dot">○</span>
            <span className="dot">○</span>
            <span className="dot">○</span>
          </div>

          <h2 className="intake-title">
            Perfekt, {data.name}! 👋
          </h2>
          
          <p className="intake-subtitle">
            Wohin soll ich deine persönliche Gründungsanalyse schicken?
          </p>
          
          <div className="question-box">
            <label className="question-label">
              Deine E-Mail Adresse
            </label>
            <input
              type="email"
              className={`intake-input ${email && !emailValid ? 'input-error' : ''}`}
              placeholder="name@beispiel.de"
              value={email}
              onChange={handleEmailChange}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && emailValid) {
                  goToNext('email', email);
                }
              }}
            />
            {email && !emailValid && (
              <p className="error-message">⚠️ Bitte gib eine gültige E-Mail ein</p>
            )}
          </div>

          <button
            onClick={() => goToNext('email', email)}
            disabled={!emailValid}
            className={`primary-button ${!emailValid ? 'disabled' : ''}`}
          >
            Weiter →
          </button>

          <div className="trust-signals">
            <div className="trust-badge">
              <span className="badge-icon">✓</span>
              <span>Keine Werbung</span>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">✓</span>
              <span>Jederzeit abmelden</span>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">✓</span>
              <span>DSGVO-konform</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: Business Idea
  if (step === 3) {
    return (
      <div className="intake-container">
        <div className="intake-card animate-fade-in">
          <div className="progress-dots">
            <span className="dot completed">●</span>
            <span className="dot completed">●</span>
            <span className="dot active">●</span>
            <span className="dot">○</span>
            <span className="dot">○</span>
            <span className="dot">○</span>
            <span className="dot">○</span>
          </div>

          <h2 className="intake-title">
            Großartig! 🎯
          </h2>
          
          <p className="intake-subtitle">
            Jetzt lass uns dein Business verstehen. Das dauert nur 2 Minuten.
          </p>
          
          <div className="question-box">
            <label className="question-label">
              Beschreibe kurz deine Geschäftsidee:
            </label>
            <textarea
              className="intake-textarea"
              placeholder="z.B. Ich möchte ein B2B Consulting-Unternehmen für Digitalisierung in KMUs gründen..."
              rows={4}
              autoFocus
              onChange={(e) => {
                if (e.target.value.length >= 10) {
                  setData({ ...data, businessIdea: e.target.value });
                }
              }}
            />
            <p className="input-hint">
              {data.businessIdea?.length || 0} / 1000 Zeichen (min. 10)
            </p>
          </div>

          <button
            onClick={() => goToNext('businessIdea', data.businessIdea!)}
            disabled={!data.businessIdea || data.businessIdea.length < 10}
            className={`primary-button ${(!data.businessIdea || data.businessIdea.length < 10) ? 'disabled' : ''}`}
          >
            Weiter →
          </button>
        </div>
      </div>
    );
  }

  // STEP 4: Business Type (Context Question 1)
  if (step === 4) {
    return (
      <div className="intake-container">
        <div className="intake-card-wide animate-fade-in">
          <div className="progress-header">
            <div className="progress-dots">
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot active">●</span>
              <span className="dot">○</span>
              <span className="dot">○</span>
              <span className="dot">○</span>
            </div>
            <span className="progress-label">Frage 1 von 5</span>
          </div>

          <h2 className="question-title">
            Hey {data.name}, lass uns dein Geschäft verstehen! 🎯
          </h2>
          
          <div className="scenario-box">
            <p className="scenario-text">
              <strong>Stell dir vor:</strong> Du triffst auf einer Gründermesse vier Personen. 
              Mit welcher Person würdest du dich am meisten identifizieren?
            </p>
          </div>
          
          <div className="choice-grid">
            <button
              onClick={() => goToNext('businessType', 'consulting')}
              className="choice-card"
            >
              <div className="choice-icon">💼</div>
              <h3 className="choice-title">Lisa - die Beraterin</h3>
              <p className="choice-description">
                "Ich helfe Unternehmen mit meinem Fachwissen. Beratung, Coaching, 
                oder spezialisierte Dienstleistungen."
              </p>
              <div className="choice-tag">Beratung / Coaching</div>
            </button>
            
            <button
              onClick={() => goToNext('businessType', 'ecommerce')}
              className="choice-card"
            >
              <div className="choice-icon">🛒</div>
              <h3 className="choice-title">Marco - der Händler</h3>
              <p className="choice-description">
                "Ich verkaufe Produkte - online, offline oder beides. 
                E-Commerce, Einzelhandel, oder Großhandel."
              </p>
              <div className="choice-tag">Handel / E-Commerce</div>
            </button>
            
            <button
              onClick={() => goToNext('businessType', 'services')}
              className="choice-card"
            >
              <div className="choice-icon">🔧</div>
              <h3 className="choice-title">Tom - der Dienstleister</h3>
              <p className="choice-description">
                "Ich biete lokale Dienstleistungen an. Handwerk, 
                Pflege, Reparatur, oder persönliche Services."
              </p>
              <div className="choice-tag">Lokale Dienstleistungen</div>
            </button>
            
            <button
              onClick={() => goToNext('businessType', 'creative')}
              className="choice-card"
            >
              <div className="choice-icon">🎨</div>
              <h3 className="choice-title">Sarah - die Kreative</h3>
              <p className="choice-description">
                "Ich erstelle Content, Designs, oder kreative Projekte. 
                Freiberuflich in der Kreativwirtschaft."
              </p>
              <div className="choice-tag">Kreativwirtschaft</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 5: Experience Level (Context Question 2)
  if (step === 5) {
    return (
      <div className="intake-container">
        <div className="intake-card-wide animate-fade-in">
          <div className="progress-header">
            <div className="progress-dots">
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot active">●</span>
              <span className="dot">○</span>
              <span className="dot">○</span>
              <span className="dot">○</span> 
            </div>
            <span className="progress-label">Frage 2 von 5</span>
          </div>

          <h2 className="question-title">
            Wie viel Erfahrung hast du mit Selbstständigkeit? 🚀
          </h2>
          
          <div className="choice-grid-vertical">
            <button
              onClick={() => goToNext('experienceLevel', 'first_time')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">🌱</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Erste Gründung</h3>
                <p className="choice-description-small">
                  Das ist mein erster Schritt in die Selbstständigkeit
                </p>
              </div>
            </button>
            
            <button
              onClick={() => goToNext('experienceLevel', 'some_experience')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">📈</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Erste Erfahrungen</h3>
                <p className="choice-description-small">
                  Ich habe schon Freelance-Projekte oder Nebentätigkeiten gemacht
                </p>
              </div>
            </button>
            
            <button
              onClick={() => goToNext('experienceLevel', 'corporate_transition')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">🏢</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Aus der Festanstellung</h3>
                <p className="choice-description-small">
                  Ich komme aus einem Job und möchte mich nun selbstständig machen
                </p>
              </div>
            </button>
            
            <button
              onClick={() => goToNext('experienceLevel', 'serial')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">🎯</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Serial Entrepreneur</h3>
                <p className="choice-description-small">
                  Ich habe schon ein oder mehrere Unternehmen gegründet
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 6: Timeline (Context Question 3)
  if (step === 6) {
    return (
      <div className="intake-container">
        <div className="intake-card-wide animate-fade-in">
          <div className="progress-header">
            <div className="progress-dots">
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot active">●</span>
              <span className="dot">○</span>
            </div>
            <span className="progress-label">Frage 3 von 5</span>
          </div>

          <h2 className="question-title">
            Wann möchtest du starten? ⏰
          </h2>
          
          <div className="choice-grid-vertical">
            <button
              onClick={() => goToNext('timeline', 'immediate')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">⚡</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Sofort / Nächsten Monat</h3>
                <p className="choice-description-small">
                  Ich bin bereit und möchte so schnell wie möglich loslegen
                </p>
              </div>
            </button>
            
            <button
              onClick={() => goToNext('timeline', '3_6_months')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">📅</div>
              <div className="choice-content">
                <h3 className="choice-title-small">In 3-6 Monaten</h3>
                <p className="choice-description-small">
                  Ich plane die Gründung für das nächste Quartal
                </p>
              </div>
            </button>
            
            <button
              onClick={() => goToNext('timeline', '6_12_months')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">🗓️</div>
              <div className="choice-content">
                <h3 className="choice-title-small">In 6-12 Monaten</h3>
                <p className="choice-description-small">
                  Ich bereite mich vor und plane für später dieses Jahr
                </p>
              </div>
            </button>
            
            <button
              onClick={() => goToNext('timeline', 'exploring')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">🔍</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Ich erkundige mich erstmal</h3>
                <p className="choice-description-small">
                  Noch keine feste Timeline, ich sammle Informationen
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 7: GZ Interest (Context Question 4)
  if (step === 7) {
    return (
      <div className="intake-container">
        <div className="intake-card-wide animate-fade-in">
          <div className="progress-header">
            <div className="progress-dots">
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot active">●</span>
            </div>
            <span className="progress-label">Frage 4 von 5</span>
          </div>

          <h2 className="question-title">
            Gründungszuschuss: Was ist dein Status? 💰
          </h2>
          
          <div className="info-box">
            <p>
              <strong>Der Gründungszuschuss</strong> bietet bis zu €31.500 Förderung 
              über 15 Monate für arbeitslose Gründer (ALG I).
            </p>
          </div>
          
          <div className="choice-grid-vertical">
            <button
              onClick={() => goToNext('gzInterest', 'alg1_ready')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">✓</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Ich beziehe ALG I</h3>
                <p className="choice-description-small">
                  Ich erfülle die Voraussetzungen und möchte beantragen
                </p>
              </div>
            </button>
            
            <button
              onClick={() => goToNext('gzInterest', 'alg1_soon')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">⏳</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Bald ALG I</h3>
                <p className="choice-description-small">
                  Ich werde demnächst arbeitslos und plane die Gründung
                </p>
              </div>
            </button>
            
            <button
              onClick={() => goToNext('gzInterest', 'interested')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">🤔</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Interessiert</h3>
                <p className="choice-description-small">
                  Ich möchte mehr über den Gründungszuschuss erfahren
                </p>
              </div>
            </button>
            
            <button
              onClick={() => goToNext('gzInterest', 'not_applicable')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">○</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Nicht zutreffend</h3>
                <p className="choice-description-small">
                  Der Gründungszuschuss ist für mich nicht relevant
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 8: Growth Vision (Context Question 5) - FINAL
  if (step === 8) {
    return (
      <div className="intake-container">
        <div className="intake-card-wide animate-fade-in">
          <div className="progress-header">
            <div className="progress-dots">
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
              <span className="dot completed">●</span>
            </div>
            <span className="progress-label">Letzte Frage!</span>
          </div>

          <h2 className="question-title">
            Wie siehst du die Zukunft deines Business? 🚀
          </h2>
          
          <div className="choice-grid-vertical">
            <button
              onClick={() => completeIntake('growthVision', 'lifestyle')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">🏝️</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Lifestyle Business</h3>
                <p className="choice-description-small">
                  Gutes Einkommen, Work-Life-Balance, Solo oder kleines Team
                </p>
              </div>
            </button>
            
            <button
              onClick={() => completeIntake('growthVision', 'stable')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">📊</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Stabiles Wachstum</h3>
                <p className="choice-description-small">
                  Kontinuierlicher Aufbau, mit Mitarbeitern, nachhaltiges Geschäft
                </p>
              </div>
            </button>
            
            <button
              onClick={() => completeIntake('growthVision', 'scale')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">🚀</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Schnelles Wachstum</h3>
                <p className="choice-description-small">
                  Skalierung, Investment, großes Team, Marktführerschaft
                </p>
              </div>
            </button>
            
            <button
              onClick={() => completeIntake('growthVision', 'flexible')}
              className="choice-card-horizontal"
            >
              <div className="choice-icon-small">🎯</div>
              <div className="choice-content">
                <h3 className="choice-title-small">Flexibel & Offen</h3>
                <p className="choice-description-small">
                  Ich lasse mich vom Markt leiten und passe mich an
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};