// SocraticBusinessIdea.tsx
import React, { useState, useEffect, useRef } from 'react';
import './SocraticBusinessIdea.css';

interface Message {
  role: 'claude' | 'user';
  text: string;
  timestamp: string;
}

interface BusinessContext {
  what?: string;
  who?: string;
  problem?: string;
  why_you?: string;
  how?: string;
  confidence: number;
  message_count?: number;
}

interface SocraticBusinessIdeaProps {
  onComplete: (context: BusinessContext, summary: string) => void;
  userId?: number;
  userName?: string;
  userEmail?: string;
}

export const SocraticBusinessIdea: React.FC<SocraticBusinessIdeaProps> = ({
  onComplete,
  userId,
  userName,
  userEmail
}) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<BusinessContext>({
    confidence: 0
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [summary, setSummary] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Start session on mount
  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/socratic/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            name: userName,
            email: userEmail
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.session_id);
        setMessages(data.conversation_history || []);
        setContext(data.context || { confidence: 0 });
      }
    } catch (error) {
      console.error('Error starting session:', error);
      // Fallback opening message
      setMessages([{
        role: 'claude',
        text: 'Hallo! 👋\n\nLass uns gemeinsam deine Geschäftsidee verstehen. Was möchtest du anbieten?',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/socratic/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            message: userMessage.text,
            conversation_history: messages,
            current_context: context
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        // Add Claude's response
        const claudeMessage: Message = {
          role: 'claude',
          text: data.question,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, claudeMessage]);
        setContext(data.context);

        // Check if we're done
        if (data.sufficient) {
          setSummary(data.summary);
          setShowConfirmation(true);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        role: 'claude',
        text: 'Entschuldigung, ich hatte ein technisches Problem. Kannst du das nochmal sagen?',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConfirm = async (confirmed: boolean) => {
    if (confirmed) {
      // User confirmed - proceed
      onComplete(context, summary);
    } else {
      // User wants to adjust
      setShowConfirmation(false);
      const adjustmentMessage: Message = {
        role: 'claude',
        text: 'Kein Problem! Was möchtest du anpassen?',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, adjustmentMessage]);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="socratic-container">
      {/* Header */}
      <div className="socratic-header">
        <div className="ai-avatar-large">🤖</div>
        <div className="header-content">
          <h3>Deine Geschäftsidee</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${context.confidence}%` }}
            />
          </div>
          <p className="progress-text">
            💬 Verstanden: {Math.round(context.confidence)}%
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.role === 'claude' && <div className="message-avatar">🤖</div>}
            <div className="message-bubble">
              <div className="message-text">{msg.text}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            {msg.role === 'user' && <div className="message-avatar user">👤</div>}
          </div>
        ))}

        {isTyping && (
          <div className="message claude typing-indicator">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Confirmation */}
      {showConfirmation && (
        <div className="confirmation-panel">
          <div className="confirmation-content">
            <h4>✓ Perfekt verstanden!</h4>
            <p>{summary}</p>
            <div className="confirmation-buttons">
              <button 
                className="btn-primary"
                onClick={() => handleConfirm(true)}
              >
                ✓ Ja, genau so!
              </button>
              <button 
                className="btn-secondary"
                onClick={() => handleConfirm(false)}
              >
                Nein, anpassen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {!showConfirmation && (
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Deine Antwort..."
            disabled={isTyping}
            autoFocus
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping}
            className="send-button"
          >
            Senden →
          </button>
        </div>
      )}

      {/* Trust signals */}
      <div className="trust-signals">
        <span>🔒 Vertraulich</span>
        <span>⚡ 2-3 Min</span>
        <span>🎯 Wissenschaftlich</span>
      </div>
    </div>
  );
};
